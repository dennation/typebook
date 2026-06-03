import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEBOUNCE_MS, DEFAULT_REGISTRY_FILE, DEFAULT_SNIPPETS_FILE, LOG_PREFIX } from '../constants.js'
import type { PropInfo, TypebookConfig } from '../types.js'
import { parseProgram } from './ast.js'
import { writeIfChanged } from './io.js'
import { generateRegistryFile, type RegistryEntry } from './registry-generator.js'
import { mayContainRegistration, type RegisterCall, scanRegistrations } from './registry-scanner.js'
import { generateSnippetsFile, type SnippetEntry } from './snippet-generator.js'
import { mayContainSnippet, scanSnippets, type SnippetBlock } from './snippet-scanner.js'
import { getSourceFilesFromTsConfig } from './source-files.js'
import { TypeScriptClient } from './ts-client.js'

export interface BuilderConfig extends TypebookConfig {
	cwd: string
}

/** A scanned `registerComponent()` call paired with the props extracted for it. */
interface IndexedRegistration {
	call: RegisterCall
	props: PropInfo[]
}

class DuplicateRegistrationError extends Error {
	constructor(id: string, files: ReadonlyArray<string>) {
		super(formatDuplicate('Each component may be registered only once.', id, files))
		this.name = 'DuplicateRegistrationError'
	}
}

class DuplicateSnippetError extends Error {
	constructor(name: string, files: ReadonlyArray<string>) {
		super(formatDuplicate('Each <Snippet> name must be unique.', name, files))
		this.name = 'DuplicateSnippetError'
	}
}

/**
 * Single source-scan pipeline. Reads and oxc-parses each project file **once**, then
 * feeds the one AST to both collectors:
 * - `scanRegistrations` → `registerComponent()` calls → `ui-registry.gen.ts`
 * - `scanSnippets`      → `<Snippet name="…">` source → `snippets.gen.ts`
 *
 * Registration props are resolved via the shared {@link TypeScriptClient}. The two
 * generated files stay independent — only file discovery, reading, and parsing are
 * shared, which is what was previously duplicated across two parallel builders.
 */
export class TypebookBuilder {
	readonly cwd: string

	private readonly registryFile: string
	private readonly snippetsFile: string
	private readonly inheritedProviders: string[] | undefined

	private tsClient: TypeScriptClient | null = null
	private debounceTimer: ReturnType<typeof setTimeout> | null = null
	private readonly pendingChanges = new Set<string>()

	private readonly registrationsByFile = new Map<string, IndexedRegistration[]>()
	private readonly snippetsByFile = new Map<string, SnippetBlock[]>()

	constructor(config: BuilderConfig) {
		this.cwd = config.cwd
		this.registryFile = config.registryFile ?? DEFAULT_REGISTRY_FILE
		this.snippetsFile = config.snippetsFile ?? DEFAULT_SNIPPETS_FILE
		this.inheritedProviders = config.inheritedProviders
	}

	get registryFilePath(): string {
		return resolve(this.cwd, this.registryFile)
	}

	get snippetsFilePath(): string {
		return resolve(this.cwd, this.snippetsFile)
	}

	async start(): Promise<void> {
		const files = getSourceFilesFromTsConfig(this.cwd)
		await this.startTsClient()
		await Promise.all(files.map((f) => this.indexFile(f)))

		this.logCounts()
		this.writeRegistry()
		this.writeSnippets()
	}

	stop(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.debounceTimer = null
		this.pendingChanges.clear()
		this.registrationsByFile.clear()
		this.snippetsByFile.clear()
		this.tsClient?.stop()
		this.tsClient = null
	}

	scheduleFileChange(filePath: string): void {
		this.pendingChanges.add(filePath)
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = null
			const changed = Array.from(this.pendingChanges)
			this.pendingChanges.clear()
			this.flushChanges(changed).catch((err) => {
				console.error(LOG_PREFIX, 'Failed to regenerate:', err)
			})
		}, DEBOUNCE_MS)
	}

	onFileRemoved(filePath: string): void {
		const hadRegistrations = this.registrationsByFile.delete(filePath)
		const hadSnippets = this.snippetsByFile.delete(filePath)
		if (hadRegistrations) this.writeRegistry()
		if (hadSnippets) this.writeSnippets()
	}

	/**
	 * Re-index every file that changed within the debounce window. A single timer
	 * coalesces rapid bursts (save-all, git checkout, codemods); without batching only
	 * the last path would survive the debounce and the rest would silently go stale.
	 */
	private async flushChanges(filePaths: string[]): Promise<void> {
		if (filePaths.length === 0) return
		if (this.tsClient) await this.tsClient.notifyChange()

		let anyNonRegistration = false
		for (const filePath of filePaths) {
			const hadRegistration = await this.indexFile(filePath)
			if (!hadRegistration) anyNonRegistration = true
		}

		// A changed non-registration file (a component or a shared type) may define props
		// consumed by registrations elsewhere. Their call sites are unchanged, so re-resolve
		// props for the *other* registrations against the refreshed TS program — skipping the
		// files we just re-indexed (already fresh). No re-read/re-parse.
		if (anyNonRegistration) await this.refreshRegistrationProps(new Set(filePaths))

		this.writeRegistry()
		this.writeSnippets()
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

	/**
	 * Read and parse a file once, updating both the registration and snippet indexes.
	 * Returns whether the file contained any `registerComponent()` call.
	 */
	private async indexFile(filePath: string): Promise<boolean> {
		const content = this.readSafe(filePath)
		const hasRegistration = content !== null && mayContainRegistration(content)
		const hasSnippet = content !== null && mayContainSnippet(content)

		if (!hasRegistration && !hasSnippet) {
			this.registrationsByFile.delete(filePath)
			this.snippetsByFile.delete(filePath)
			return false
		}

		const program = await parseProgram(filePath, content as string)

		if (hasRegistration) {
			await this.indexRegistrations(filePath, scanRegistrations(program))
		} else {
			this.registrationsByFile.delete(filePath)
		}

		if (hasSnippet) {
			this.indexSnippets(filePath, scanSnippets(program, content as string))
		} else {
			this.snippetsByFile.delete(filePath)
		}

		return hasRegistration
	}

	private async indexRegistrations(filePath: string, calls: RegisterCall[]): Promise<void> {
		if (calls.length === 0) {
			this.registrationsByFile.delete(filePath)
			return
		}
		const registrations = await Promise.all(
			calls.map(async (call) => ({ call, props: await this.resolveProps(filePath, call.callStart) })),
		)
		this.registrationsByFile.set(filePath, registrations)
	}

	private indexSnippets(filePath: string, blocks: SnippetBlock[]): void {
		if (blocks.length === 0) {
			this.snippetsByFile.delete(filePath)
			return
		}
		this.snippetsByFile.set(filePath, blocks)
	}

	/** Re-resolve props for known registrations outside `skipFiles` (call sites unchanged, types may not be). */
	private async refreshRegistrationProps(skipFiles: ReadonlySet<string>): Promise<void> {
		await Promise.all(
			Array.from(this.registrationsByFile.entries())
				.filter(([filePath]) => !skipFiles.has(filePath))
				.map(async ([filePath, registrations]) => {
					const refreshed = await Promise.all(
						registrations.map(async ({ call }) => ({
							call,
							props: await this.resolveProps(filePath, call.callStart),
						})),
					)
					this.registrationsByFile.set(filePath, refreshed)
				}),
		)
	}

	private async resolveProps(filePath: string, callStart: number): Promise<PropInfo[]> {
		if (!this.tsClient) return []
		return (await this.tsClient.getRegisterProps(filePath, callStart)) ?? []
	}

	private writeRegistry(): void {
		const content = generateRegistryFile(this.collectRegistryEntries(), this.registryFilePath)
		writeIfChanged(this.registryFilePath, content)
	}

	private writeSnippets(): void {
		const entries = this.collectSnippetEntries()

		// Don't litter a stray empty file in projects that never use <Snippet>. Once the
		// file exists we keep it in sync (even down to empty) so `import { snippets }` resolves.
		if (entries.length === 0 && !existsSync(this.snippetsFilePath)) return

		writeIfChanged(this.snippetsFilePath, generateSnippetsFile(entries, this.snippetsFilePath))
	}

	private collectRegistryEntries(): RegistryEntry[] {
		const byId = new Map<string, RegistryEntry>()

		for (const [filePath, registrations] of this.registrationsByFile.entries()) {
			for (const { call, props } of registrations) {
				const existing = byId.get(call.id)
				if (existing) {
					throw new DuplicateRegistrationError(call.id, [existing.definingFile, filePath])
				}
				byId.set(call.id, {
					id: call.id,
					definingFile: filePath,
					componentImport: call.componentImport,
					props,
				})
			}
		}

		return Array.from(byId.values())
	}

	private collectSnippetEntries(): SnippetEntry[] {
		const byName = new Map<string, { entry: SnippetEntry; file: string }>()

		for (const [filePath, blocks] of this.snippetsByFile.entries()) {
			for (const block of blocks) {
				const existing = byName.get(block.name)
				if (existing) {
					throw new DuplicateSnippetError(block.name, [existing.file, filePath])
				}
				byName.set(block.name, { entry: { name: block.name, code: block.code }, file: filePath })
			}
		}

		return Array.from(byName.values(), (v) => v.entry)
	}

	private logCounts(): void {
		let registrations = 0
		for (const list of this.registrationsByFile.values()) registrations += list.length
		console.log(
			LOG_PREFIX,
			`Found ${registrations} registerComponent() call(s) across ${this.registrationsByFile.size} file(s); generated ${this.registryFile}`,
		)

		let snippets = 0
		for (const list of this.snippetsByFile.values()) snippets += list.length
		if (snippets > 0) {
			console.log(LOG_PREFIX, `Extracted ${snippets} <Snippet> block(s) to ${this.snippetsFile}`)
		}
	}

	private readSafe(filePath: string): string | null {
		try {
			return readFileSync(filePath, 'utf-8')
		} catch {
			return null
		}
	}
}

function formatDuplicate(headline: string, key: string, files: ReadonlyArray<string>): string {
	return [`${headline} Duplicate found:`, `  - ${key}`, ...files.map((f) => `      ${f}`)].join('\n')
}
