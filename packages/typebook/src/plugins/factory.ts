import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { PACKAGE_NAME } from '../constants.js'
import { RegistryBuilder } from '../core/registry.js'
import type { TypebookConfig } from '../types.js'

/**
 * Shared unplugin factory. Works across every bundler unplugin supports
 * (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm).
 *
 * - `buildStart` (universal) performs a full scan + registry generation. It is
 *   idempotent and re-fires on each rebuild, so watch mode in Rollup / webpack /
 *   Rspack keeps the generated file fresh.
 * - The `vite` namespace adds incremental, debounced regeneration through the
 *   dev server's file watcher for the best DX during `vite dev`.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (config = {}) => {
	let builder: RegistryBuilder | undefined

	const ensureBuilder = (cwd: string): RegistryBuilder => {
		if (!builder) builder = new RegistryBuilder({ cwd, ...config })
		return builder
	}

	return {
		name: PACKAGE_NAME,

		async buildStart() {
			await ensureBuilder(process.cwd()).start()
		},

		buildEnd() {
			builder?.stop()
		},

		vite: {
			configResolved(resolvedConfig) {
				ensureBuilder(resolvedConfig.root)
			},

			configureServer(server) {
				const active = ensureBuilder(server.config.root)
				const isGenFile = (path: string) => path === active.registryFilePath

				server.watcher.on('change', (path) => {
					if (!isGenFile(path)) active.scheduleFileChange(path)
				})

				server.watcher.on('add', (path) => {
					if (!isGenFile(path)) active.scheduleFileChange(path)
				})

				server.watcher.on('unlink', (path) => {
					if (!isGenFile(path)) active.onFileRemoved(path)
				})
			},
		},
	}
}

export const unplugin = createUnplugin(unpluginFactory)

export default unplugin
