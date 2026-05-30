import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEBOUNCE_MS, DEFAULT_REGISTRY_FILE, LOG_PREFIX } from '../constants.js'
import type { PropInfo, TypebookConfig } from '../types.js'
import { generateRegistryFile, type RegistryEntry } from './generator.js'
import { writeIfChanged } from './io.js'
import { analyzeFile, mayContainRegister, type RegisterCall } from './scanner.js'
import { getSourceFilesFromTsConfig } from './source-files.js'
import { TypeScriptClient } from './ts-client.js'

export interface RegistryBuilderConfig extends TypebookConfig {
	cwd: string
}

interface FileRegister {
	call: RegisterCall
	props: PropInfo[]
}

class DuplicateRegistrationError extends Error {
	constructor(id: string, files: ReadonlyArray<string>) {
		super(formatDuplicateMessage(id, files))
		this.name = 'DuplicateRegistrationError'
	}
}

export class RegistryBuilder {
	readonly cwd: string

	private readonly registryFile: string
	private readonly inheritedProviders: string[] | undefined

	private tsClient: TypeScriptClient | null = null
	private debounceTimer: ReturnType<typeof setTimeout> | null = null

	private readonly registersByFile = new Map<string, FileRegister[]>()

	constructor(config: RegistryBuilderConfig) {
		this.cwd = config.cwd
		this.registryFile = config.registryFile ?? DEFAULT_REGISTRY_FILE
		this.inheritedProviders = config.inheritedProviders
	}

	get registryFilePath(): string {
		return resolve(this.cwd, this.registryFile)
	}

	async start(): Promise<void> {
		const files = getSourceFilesFromTsConfig(this.cwd)
		await this.startTsClient()
		await Promise.all(files.map((f) => this.indexFile(f)))

		let count = 0
		for (const list of this.registersByFile.values()) count += list.length
		console.log(LOG_PREFIX, `Found ${count} registerComponent() call(s) across ${this.registersByFile.size} file(s)`)

		this.flushGenFile()
		console.log(LOG_PREFIX, `Generated ${this.registryFile}`)
	}

	stop(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.registersByFile.clear()
		this.tsClient?.stop()
		this.tsClient = null
	}

	scheduleFileChange(filePath: string): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.debounceTimer = setTimeout(async () => {
			try {
				await this.onFileChanged(filePath)
			} catch (err) {
				console.error(LOG_PREFIX, 'Failed to regenerate:', err)
			}
		}, DEBOUNCE_MS)
	}

	onFileRemoved(filePath: string): void {
		if (this.registersByFile.delete(filePath)) {
			this.flushGenFile()
		}
	}

	private async onFileChanged(filePath: string): Promise<void> {
		if (this.tsClient) await this.tsClient.notifyChange()

		const content = this.readSafe(filePath)
		const hasRegister = content !== null && mayContainRegister(content)

		if (hasRegister) {
			await this.indexFile(filePath)
		} else {
			// File may affect props declared in other files — reindex all known registry files
			await Promise.all(Array.from(this.registersByFile.keys()).map((f) => this.indexFile(f)))
		}

		this.flushGenFile()
	}

	private async startTsClient(): Promise<void> {
		const client = new TypeScriptClient(this.cwd, this.inheritedProviders)
		try {
			await client.start()
			this.tsClient = client
		} catch (err) {
			console.warn(LOG_PREFIX, 'TypeScript client unavailable; running without type extraction')
			console.warn(LOG_PREFIX, (err as Error).message)
		}
	}

	private async indexFile(filePath: string): Promise<void> {
		const content = this.readSafe(filePath)
		if (content === null || !mayContainRegister(content)) {
			this.registersByFile.delete(filePath)
			return
		}

		const registers = await analyzeFile(filePath, content)
		if (registers.length === 0) {
			this.registersByFile.delete(filePath)
			return
		}

		const fileRegisters: FileRegister[] = []
		for (const call of registers) {
			const props = this.tsClient
				? ((await this.tsClient.getRegisterProps(filePath, call.callStart)) ?? [])
				: []
			fileRegisters.push({ call, props })
		}
		this.registersByFile.set(filePath, fileRegisters)
	}

	private flushGenFile(): void {
		const entries = this.collectEntries()
		const content = generateRegistryFile(entries, this.registryFilePath)
		writeIfChanged(this.registryFilePath, content)
	}

	private collectEntries(): RegistryEntry[] {
		const byId = new Map<string, RegistryEntry>()

		for (const [filePath, list] of this.registersByFile.entries()) {
			for (const reg of list) {
				const id = reg.call.id
				const existing = byId.get(id)
				if (existing) {
					throw new DuplicateRegistrationError(id, [existing.definingFile, filePath])
				}
				byId.set(id, {
					id,
					definingFile: filePath,
					componentImport: reg.call.componentImport,
					props: reg.props,
				})
			}
		}

		return Array.from(byId.values())
	}

	private readSafe(filePath: string): string | null {
		try {
			return readFileSync(filePath, 'utf-8')
		} catch {
			return null
		}
	}
}

function formatDuplicateMessage(id: string, files: ReadonlyArray<string>): string {
	return [
		`Each component may be registered only once. Duplicate found:`,
		`  - ${id}`,
		...files.map((f) => `      ${f}`),
	].join('\n')
}
