import { relative } from 'node:path'
import type { Compiler } from 'webpack'
import type { StudioConfig } from '../../types.js'
import { StudioCompiler } from '../../core/compiler.js'
import { PACKAGE_NAME } from '../../constants.js'

export class UiStudioWebpackPlugin {
	private readonly config: StudioConfig

	constructor(config?: StudioConfig) {
		this.config = config ?? {}
	}

	apply(compiler: Compiler): void {
		let studio: StudioCompiler | null = null

		// First compilation: init compiler and generate
		compiler.hooks.beforeCompile.tapPromise(PACKAGE_NAME, async () => {
			if (!studio) {
				studio = new StudioCompiler({ cwd: compiler.context, ...this.config })
				await studio.start()
			}
		})

		// Watch mode: regenerate on file changes
		compiler.hooks.watchRun.tapPromise(PACKAGE_NAME, async (comp) => {
			if (!studio) return

			const modified = comp.modifiedFiles ?? new Set<string>()
			const removed = comp.removedFiles ?? new Set<string>()

			for (const absPath of removed) {
				const relPath = relative(compiler.context, absPath)
				if (studio.matchesStoryGlob(relPath)) {
					studio.evictTypeCache(absPath)
				}
			}

			const changedStoryFile = findFirstStoryFile(studio, compiler.context, modified)

			if (changedStoryFile || removed.size > 0) {
				await studio.regenerate(changedStoryFile)
			}
		})

		// Cleanup on shutdown
		compiler.hooks.shutdown.tapPromise(PACKAGE_NAME, async () => {
			if (studio) {
				studio.stop()
				studio = null
			}
		})
	}
}

function findFirstStoryFile(
	studio: StudioCompiler,
	context: string,
	files: ReadonlySet<string>,
): string | undefined {
	for (const absPath of files) {
		if (absPath.endsWith('.ts') || absPath.endsWith('.tsx')) {
			const relPath = relative(context, absPath)
			if (studio.matchesStoryGlob(relPath)) {
				return absPath
			}
		}
	}
	return undefined
}
