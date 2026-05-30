import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { PACKAGE_NAME } from '../constants.js'
import { RegistryBuilder } from '../core/registry.js'
import { SnippetBuilder } from '../core/snippets.js'
import type { TypebookConfig } from '../types.js'

/** Lifecycle shared by the registry and snippet builders. */
interface FileWatchTarget {
	start(): Promise<void>
	stop(): void
	scheduleFileChange(path: string): void
	onFileRemoved(path: string): void
}

/**
 * Shared unplugin factory — no bundler is privileged. Works across every
 * bundler unplugin supports (Vite, Rollup, Rolldown, webpack, Rspack, esbuild,
 * Farm).
 *
 * Two builders run side by side off the same source files:
 * - `RegistryBuilder` scans `registerComponent()` calls → `ui-registry.gen.ts`.
 * - `SnippetBuilder` extracts `<Snippet name="…">` source → `{snippetsDir}/{name}.txt`.
 *
 * - `buildStart` (universal) performs a full scan + generation for both. It is
 *   idempotent and re-fires on each rebuild, so watch mode in any bundler keeps
 *   the generated artifacts fresh.
 * - The `vite` namespace is an optional optimization: Vite's dev server does not
 *   re-run `buildStart` per file change, so it wires the server watcher for
 *   incremental, debounced regeneration. Other bundlers fall back to the
 *   universal `buildStart` rebuild.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (config = {}) => {
	let registry: RegistryBuilder | undefined
	let targets: FileWatchTarget[] | undefined

	const ensureBuilders = (cwd: string): FileWatchTarget[] => {
		if (!targets) {
			registry = new RegistryBuilder({ cwd, ...config })
			targets = [registry, new SnippetBuilder({ cwd, ...config })]
		}
		return targets
	}

	return {
		name: PACKAGE_NAME,

		async buildStart() {
			await Promise.all(ensureBuilders(process.cwd()).map((t) => t.start()))
		},

		buildEnd() {
			targets?.forEach((t) => t.stop())
		},

		vite: {
			configResolved(resolvedConfig) {
				ensureBuilders(resolvedConfig.root)
			},

			configureServer(server) {
				const active = ensureBuilders(server.config.root)
				const isGenFile = (path: string) => path === registry?.registryFilePath

				server.watcher.on('change', (path) => {
					if (!isGenFile(path)) active.forEach((t) => t.scheduleFileChange(path))
				})

				server.watcher.on('add', (path) => {
					if (!isGenFile(path)) active.forEach((t) => t.scheduleFileChange(path))
				})

				server.watcher.on('unlink', (path) => {
					if (!isGenFile(path)) active.forEach((t) => t.onFileRemoved(path))
				})
			},
		},
	}
}

export const unplugin = createUnplugin(unpluginFactory)

export default unplugin
