import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEBOUNCE_MS, DEFAULT_SNIPPETS_DIR, LOG_PREFIX, SNIPPET_FILE_EXT } from '../constants.js'
import type { TypebookConfig } from '../types.js'
import { removeIfExists, writeIfChanged } from './io.js'
import { analyzeSnippets, mayContainSnippet, type SnippetBlock } from './snippet-scanner.js'
import { getSourceFilesFromTsConfig } from './source-files.js'

export interface SnippetBuilderConfig extends TypebookConfig {
	cwd: string
}

/** A `name` must map to a single, traversal-safe file under the snippets dir. */
const SAFE_NAME = /^[A-Za-z0-9._-]+$/

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
 * writes each block to `{snippetsDir}/{name}.txt`. Mirrors {@link RegistryBuilder}'s
 * lifecycle (start / stop / watch hooks) so the unplugin factory can drive both
 * uniformly across every bundler.
 */
export class SnippetBuilder {
	readonly cwd: string

	private readonly snippetsDir: string
	private debounceTimer: ReturnType<typeof setTimeout> | null = null

	private readonly snippetsByFile = new Map<string, SnippetBlock[]>()
	/** Absolute paths we wrote on the last flush — used to clean up stale files. */
	private written = new Set<string>()

	constructor(config: SnippetBuilderConfig) {
		this.cwd = config.cwd
		this.snippetsDir = config.snippetsDir ?? DEFAULT_SNIPPETS_DIR
	}

	get snippetsDirPath(): string {
		return resolve(this.cwd, this.snippetsDir)
	}

	async start(): Promise<void> {
		const files = getSourceFilesFromTsConfig(this.cwd)
		await Promise.all(files.map((f) => this.indexFile(f)))

		let count = 0
		for (const list of this.snippetsByFile.values()) count += list.length
		this.flush()
		if (count > 0) {
			console.log(LOG_PREFIX, `Extracted ${count} <Snippet> block(s) to ${this.snippetsDir}`)
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
				this.flush()
			} catch (err) {
				console.error(LOG_PREFIX, 'Failed to extract snippets:', err)
			}
		}, DEBOUNCE_MS)
	}

	onFileRemoved(filePath: string): void {
		if (this.snippetsByFile.delete(filePath)) {
			this.flush()
		}
	}

	private async indexFile(filePath: string): Promise<void> {
		const content = this.readSafe(filePath)
		if (content === null || !mayContainSnippet(content)) {
			this.snippetsByFile.delete(filePath)
			return
		}

		const blocks = await analyzeSnippets(filePath, content)
		if (blocks.length === 0) {
			this.snippetsByFile.delete(filePath)
			return
		}
		this.snippetsByFile.set(filePath, blocks)
	}

	private flush(): void {
		const byName = this.collectByName()

		const next = new Set<string>()
		for (const [name, block] of byName) {
			const filePath = resolve(this.snippetsDirPath, `${name}${SNIPPET_FILE_EXT}`)
			writeIfChanged(filePath, block.code)
			next.add(filePath)
		}

		// Remove files for snippets that no longer exist (renamed / deleted).
		for (const filePath of this.written) {
			if (!next.has(filePath)) removeIfExists(filePath)
		}
		this.written = next
	}

	private collectByName(): Map<string, SnippetBlock> {
		const byName = new Map<string, SnippetBlock>()
		const definingFile = new Map<string, string>()

		for (const [filePath, blocks] of this.snippetsByFile.entries()) {
			for (const block of blocks) {
				if (!SAFE_NAME.test(block.name)) {
					console.warn(
						LOG_PREFIX,
						`Skipping <Snippet> with unsafe name ${JSON.stringify(block.name)} in ${filePath} (allowed: letters, digits, ., _, -)`,
					)
					continue
				}
				if (byName.has(block.name)) {
					throw new DuplicateSnippetError(block.name, [definingFile.get(block.name) as string, filePath])
				}
				byName.set(block.name, block)
				definingFile.set(block.name, filePath)
			}
		}

		return byName
	}

	private readSafe(filePath: string): string | null {
		try {
			return readFileSync(filePath, 'utf-8')
		} catch {
			return null
		}
	}
}
