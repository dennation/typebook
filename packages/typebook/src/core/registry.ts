import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import {
	DEBOUNCE_MS,
	DEFAULT_REGISTRY_FILE,
	LOG_PREFIX,
} from '../constants.js'
import type { PropInfo, TypebookConfig } from '../types.js'
import { generateRegistryFile, type RegistryComponent } from './generator.js'
import { writeIfChanged } from './io.js'
import {
	type RegisterCall,
	analyzeFile,
	mayContainRegister,
} from './scanner.js'
import { TypeScriptClient } from './ts-client.js'

export interface RegistryBuilderConfig extends TypebookConfig {
	cwd: string
}

/** A single `register()` call with its extracted props, scoped to a source file. */
interface FileRegister {
	filePath: string
	call: RegisterCall
	props: PropInfo[]
}

/**
 * Thrown when the same component is registered from more than one location.
 * Each component may be registered only once.
 */
class DuplicateRegistrationError extends Error {
	readonly componentKey: string
	readonly files: ReadonlyArray<string>

	constructor(componentKey: string, files: ReadonlyArray<string>) {
		super(formatDuplicateMessage(componentKey, files))
		this.name = 'DuplicateRegistrationError'
		this.componentKey = componentKey
		this.files = files
	}
}

/**
 * Build-time index of every `register(Component, ...)` call found in the project.
 * Each component must be registered only once — a second `register()` call for
 * the same component throws `DuplicateRegistrationError`.
 *
 * Lifecycle:
 *   `start()`          — initial scan, type extraction, write gen file
 *   `onFileChanged()`  — re-index one file after a watcher event
 *   `onFileRemoved()`  — drop a file from the index
 *   `stop()`           — cleanup
 */
export class RegistryBuilder {
	readonly cwd: string

	private readonly registryFile: string
	private readonly inheritedProviders: string[] | undefined
	private sourceFiles: Set<string> = new Set()

	private tsClient: TypeScriptClient | null = null
	private debounceTimer: ReturnType<typeof setTimeout> | null = null

	/** filePath → register calls extracted from that file */
	private readonly registersByFile = new Map<string, FileRegister[]>()

	constructor(config: RegistryBuilderConfig) {
		this.cwd = config.cwd
		this.registryFile = config.registryFile ?? DEFAULT_REGISTRY_FILE
		this.inheritedProviders = config.inheritedProviders
	}

	// --- Public: file paths ---

	get registryFilePath(): string {
		return resolve(this.cwd, this.registryFile)
	}

	// --- Public: lifecycle ---

	/** Initial scan of files from tsconfig → type extraction → write gen file. */
	async start(): Promise<void> {
		const files = getSourceFilesFromTsConfig(this.cwd)
		this.sourceFiles = new Set(files)
		await this.startTsClient()
		await Promise.all(files.map((file) => this.indexFile(file)))

		console.log(
			LOG_PREFIX,
			`Found ${this.registerCount()} register() call(s) across ${this.registersByFile.size} file(s)`,
		)

		this.flushGenFile()
		console.log(LOG_PREFIX, `Generated ${this.registryFile}`)
	}

	stop(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.registersByFile.clear()
		this.tsClient?.stop()
		this.tsClient = null
	}

	// --- Public: watcher hooks ---

	isSourceFile(absPath: string): boolean {
		return this.sourceFiles.has(absPath)
	}

	async onFileChanged(filePath: string): Promise<void> {
		this.sourceFiles.add(filePath)
		if (this.tsClient) await this.tsClient.notifyChange(filePath)
		await this.indexFile(filePath)
		this.flushGenFile()
	}

	onFileRemoved(filePath: string): void {
		if (this.registersByFile.delete(filePath)) {
			this.flushGenFile()
		}
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

	// --- Internals ---

	private async startTsClient(): Promise<void> {
		const client = new TypeScriptClient(this.cwd, this.inheritedProviders)
		try {
			await client.start()
			this.tsClient = client
			console.log(LOG_PREFIX, 'TypeScript client started')
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

		const { registers } = await analyzeFile(filePath, content)
		if (registers.length === 0) {
			this.registersByFile.delete(filePath)
			return
		}

		const fileRegisters: FileRegister[] = []
		for (const call of registers) {
			const props = this.tsClient
				? ((await this.tsClient.getRegisterProps(filePath, call.callStart)) ?? [])
				: []
			fileRegisters.push({ filePath, call, props })
		}
		this.registersByFile.set(filePath, fileRegisters)
	}

	/**
	 * Walk all registers, asserting each component is registered exactly once,
	 * and emit the registry file.
	 */
	private flushGenFile(): void {
		const components = this.collectComponents()
		const content = generateRegistryFile(components, this.registryFilePath)
		writeIfChanged(this.registryFilePath, content)
	}

	private collectComponents(): RegistryComponent[] {
		const byId = new Map<string, RegistryComponent>()

		for (const list of this.registersByFile.values()) {
			for (const reg of list) {
				const id = reg.call.id
				const existing = byId.get(id)
				if (existing) {
					throw new DuplicateRegistrationError(id, [existing.definingFile, reg.filePath])
				}
				byId.set(id, {
					id,
					definingFile: reg.filePath,
					componentImport: reg.call.componentImport,
					props: reg.props,
				})
			}
		}

		return Array.from(byId.values())
	}

	private registerCount(): number {
		let n = 0
		for (const list of this.registersByFile.values()) n += list.length
		return n
	}

	private readSafe(filePath: string): string | null {
		try {
			return readFileSync(filePath, 'utf-8')
		} catch {
			return null
		}
	}
}

function getSourceFilesFromTsConfig(cwd: string): string[] {
	const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, 'tsconfig.json')
	if (!configPath) {
		console.warn(LOG_PREFIX, 'tsconfig.json not found, no files to scan')
		return []
	}
	const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
	if (configFile.error) {
		console.warn(LOG_PREFIX, 'Failed to read tsconfig.json:', ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
		return []
	}
	const { fileNames } = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd)
	return fileNames
}

function formatDuplicateMessage(componentKey: string, files: ReadonlyArray<string>): string {
	return [
		`Each component may be registered only once. Duplicate found:`,
		`  - ${componentKey}`,
		...files.map((f) => `      ${f}`),
	].join('\n')
}
