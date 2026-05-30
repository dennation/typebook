import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEBOUNCE_MS, DEFAULT_SNIPPETS_FILE, LOG_PREFIX } from '../constants.js'
import type { TypebookConfig } from '../types.js'
import { writeIfChanged } from './io.js'
import { generateSnippetsFile, type SnippetEntry } from './snippet-generator.js'
import { mayContainSnippet, scanSnippets, type SnippetBlock } from './snippet-scanner.js'
import { getSourceFilesFromTsConfig } from './source-files.js'

export interface SnippetBuilderConfig extends TypebookConfig {
	cwd: string
}

class DuplicateSnippetError extends Error {
	constructor(name: string, files: ReadonlyArray<string>) {
		super(
			[
				`Each <Snippet> name must be unique. Duplicate found:`,
				`  - ${name}`,
				...files.map((f) => `      ${f}`),
			].join('\n'),
		)
		this.name = 'DuplicateSnippetError'
	}
}

/**
 * Extracts `<Snippet name="…">…</Snippet>` source from a project's files and
 * emits it as a single generated `snippets.gen.ts` map (`name → code`). Mirrors
 * {@link RegistryBuilder}'s lifecycle (start / stop / watch hooks) so the
 * unplugin factory can drive both uniformly across every bundler.
 */
export class SnippetBuilder {
	readonly cwd: string

	private readonly snippetsFile: string
	private debounceTimer: ReturnType<typeof setTimeout> | null = null

	private readonly snippetsByFile = new Map<string, SnippetBlock[]>()

	constructor(config: SnippetBuilderConfig) {
		this.cwd = config.cwd
		this.snippetsFile = config.snippetsFile ?? DEFAULT_SNIPPETS_FILE
	}

	get snippetsFilePath(): string {
		return resolve(this.cwd, this.snippetsFile)
	}

	async start(): Promise<void> {
		const files = getSourceFilesFromTsConfig(this.cwd)
		await Promise.all(files.map((f) => this.indexFile(f)))

		let count = 0
		for (const list of this.snippetsByFile.values()) count += list.length
		this.flushGenFile()
		if (count > 0) {
			console.log(LOG_PREFIX, `Extracted ${count} <Snippet> block(s) to ${this.snippetsFile}`)
		}
	}

	stop(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.snippetsByFile.clear()
	}

	scheduleFileChange(filePath: string): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.debounceTimer = setTimeout(async () => {
			try {
				await this.indexFile(filePath)
				this.flushGenFile()
			} catch (err) {
				console.error(LOG_PREFIX, 'Failed to extract snippets:', err)
			}
		}, DEBOUNCE_MS)
	}

	onFileRemoved(filePath: string): void {
		if (this.snippetsByFile.delete(filePath)) {
			this.flushGenFile()
		}
	}

	private async indexFile(filePath: string): Promise<void> {
		// Never scan our own generated output.
		if (filePath === this.snippetsFilePath) return

		const content = this.readSafe(filePath)
		if (content === null || !mayContainSnippet(content)) {
			this.snippetsByFile.delete(filePath)
			return
		}

		const blocks = await scanSnippets(filePath, content)
		if (blocks.length === 0) {
			this.snippetsByFile.delete(filePath)
			return
		}
		this.snippetsByFile.set(filePath, blocks)
	}

	private flushGenFile(): void {
		const entries = this.collectEntries()

		// Don't litter a stray empty file in projects that never use <Snippet>.
		// Once the file exists we keep it in sync (even down to empty) so a
		// consumer's `import { snippets }` keeps resolving.
		if (entries.length === 0 && !existsSync(this.snippetsFilePath)) return

		const content = generateSnippetsFile(entries, this.snippetsFilePath)
		writeIfChanged(this.snippetsFilePath, content)
	}

	private collectEntries(): SnippetEntry[] {
		const byName = new Map<string, SnippetEntry>()
		const definingFile = new Map<string, string>()

		for (const [filePath, blocks] of this.snippetsByFile.entries()) {
			for (const block of blocks) {
				if (byName.has(block.name)) {
					throw new DuplicateSnippetError(block.name, [definingFile.get(block.name) as string, filePath])
				}
				byName.set(block.name, { name: block.name, code: block.code })
				definingFile.set(block.name, filePath)
			}
		}

		return Array.from(byName.values())
	}

	private readSafe(filePath: string): string | null {
		try {
			return readFileSync(filePath, 'utf-8')
		} catch {
			return null
		}
	}
}
