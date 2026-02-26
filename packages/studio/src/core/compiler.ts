import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import picomatch from 'picomatch'
import type { StudioConfig, PropInfo } from '../types.js'
import { TypeScriptClient } from './ts-client.js'
import { findFiles, analyzeStoryFile, analyzePageFile } from './scanner.js'
import { generateRegistryFile, generateMetaFile } from './generator.js'
import {
	LOG_PREFIX,
	DEFAULT_REGISTRY_FILE,
	DEFAULT_META_FILE,
	DEFAULT_STORIES_GLOB,
	DEFAULT_PAGES_GLOB,
	DEBOUNCE_MS,
} from '../constants.js'

export interface CompilerConfig extends StudioConfig {
	cwd: string
}

export class StudioCompiler {
	readonly cwd: string
	private readonly storiesGlob: string
	private readonly pagesGlob: string
	private readonly registryOutput: string
	private readonly metaOutput: string
	private readonly isStoryFile: (path: string) => boolean
	private readonly isPageFile: (path: string) => boolean

	private tsClient: TypeScriptClient | null = null
	private storyFiles: string[] = []
	private pageFiles: string[] = []
	private debounceTimer: ReturnType<typeof setTimeout> | null = null
	private readonly typeCache = new Map<string, PropInfo[]>()
	private readonly inheritedProviders: string[] | undefined

	constructor(config: CompilerConfig) {
		this.cwd = config.cwd
		this.storiesGlob = config.stories ?? DEFAULT_STORIES_GLOB
		this.pagesGlob = config.pages ?? DEFAULT_PAGES_GLOB
		this.registryOutput = config.output ?? DEFAULT_REGISTRY_FILE
		this.metaOutput = config.metaOutput ?? DEFAULT_META_FILE
		this.isStoryFile = picomatch(this.storiesGlob)
		this.isPageFile = picomatch(this.pagesGlob)
		this.inheritedProviders = config.inheritedProviders
	}

	/** Resolved absolute path to the registry gen file */
	get registryFilePath(): string {
		return resolve(this.cwd, this.registryOutput)
	}

	/** Resolved absolute path to the meta gen file */
	get metaFilePath(): string {
		return resolve(this.cwd, this.metaOutput)
	}

	/** Initialize TS client, scan story files, and generate */
	async start(): Promise<void> {
		this.storyFiles = await findFiles(this.cwd, this.storiesGlob)
		this.pageFiles = await findFiles(this.cwd, this.pagesGlob)
		console.log(LOG_PREFIX, `Found ${this.storyFiles.length} story file(s), ${this.pageFiles.length} page file(s)`)

		const client = new TypeScriptClient(this.cwd, this.inheritedProviders)
		try {
			await client.start()
			this.tsClient = client
			console.log(LOG_PREFIX, 'TypeScript client started')
		} catch (err) {
			console.warn(LOG_PREFIX, 'TypeScript client not available, running without type extraction')
			console.warn(LOG_PREFIX, (err as Error).message)
		}

		await this.regenerate()
		console.log(LOG_PREFIX, `Generated ${this.registryOutput} and ${this.metaOutput}`)
	}

	/** Clean up TS client and timers */
	stop(): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.typeCache.clear()
		if (this.tsClient) {
			this.tsClient.stop()
			this.tsClient = null
		}
	}

	/** Check if a relative path matches the story file glob */
	matchesStoryGlob(relPath: string): boolean {
		return this.isStoryFile(relPath)
	}

	/** Check if a relative path matches the page file glob */
	matchesPageGlob(relPath: string): boolean {
		return this.isPageFile(relPath)
	}

	/** Get the relative path of a file from cwd */
	relativePath(absPath: string): string {
		return relative(this.cwd, absPath)
	}

	/** Full regeneration: rescan files, extract types, write gen files */
	async regenerate(changedFile?: string): Promise<void> {
		this.storyFiles = await findFiles(this.cwd, this.storiesGlob)
		this.pageFiles = await findFiles(this.cwd, this.pagesGlob)

		if (this.tsClient && changedFile) {
			this.invalidateTypeCache(changedFile)
			await this.tsClient.notifyChange(changedFile)
		}

		const files = await Promise.all(
			this.storyFiles.map(async (filePath) => {
				const content = readFileSync(filePath, 'utf-8')
				const analysis = await analyzeStoryFile(content)
				const props = await this.extractTypes(filePath)
				return { filePath, analysis, props }
			}),
		)

		const pageFileInfos = await Promise.all(
			this.pageFiles.map(async (filePath) => {
				const content = readFileSync(filePath, 'utf-8')
				const analysis = await analyzePageFile(content)
				return { filePath, analysis }
			}),
		)

		const metaContent = generateMetaFile(files, this.cwd)
		writeIfChanged(this.metaFilePath, metaContent)

		const registryContent = generateRegistryFile(files, pageFileInfos, this.registryFilePath, this.metaFilePath, this.cwd)
		writeIfChanged(this.registryFilePath, registryContent)
	}

	/** Debounced regeneration for watch mode */
	debouncedRegenerate(changedFile?: string): void {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)
		this.debounceTimer = setTimeout(async () => {
			try {
				await this.regenerate(changedFile)
			} catch (err) {
				console.error(LOG_PREFIX, 'Failed to regenerate:', err)
			}
		}, DEBOUNCE_MS)
	}

	/** Remove a specific file from the type cache (e.g. on delete) */
	evictTypeCache(absPath: string): void {
		this.typeCache.delete(absPath)
	}

	private async extractTypes(filePath: string): Promise<PropInfo[]> {
		if (!this.tsClient) return []

		const cached = this.typeCache.get(filePath)
		if (cached) return cached

		const props = await this.tsClient.getComponentProps(filePath)
		const result = props ?? []
		this.typeCache.set(filePath, result)
		return result
	}

	private invalidateTypeCache(changedFile: string): void {
		const relChanged = relative(this.cwd, changedFile)
		if (this.isStoryFile(relChanged)) {
			this.typeCache.delete(changedFile)
		} else {
			this.typeCache.clear()
		}
	}
}

/** Write file only if content differs from existing */
export function writeIfChanged(filePath: string, content: string): void {
	const existing = existsSync(filePath)
		? readFileSync(filePath, 'utf-8')
		: ''
	if (content !== existing) {
		writeFileSync(filePath, content, 'utf-8')
	}
}
