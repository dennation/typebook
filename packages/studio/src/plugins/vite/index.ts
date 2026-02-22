import { relative } from 'node:path'
import type { Plugin } from 'vite'
import type { StudioConfig } from '../../types.js'
import { StudioCompiler } from '../../core/compiler.js'
import { PACKAGE_NAME, VIRTUAL_MODULE_ID } from '../../constants.js'

const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function uiStudio(config?: StudioConfig): Plugin {
	let compiler: StudioCompiler

	return {
		name: PACKAGE_NAME,

		configResolved(resolvedConfig) {
			compiler = new StudioCompiler({ cwd: resolvedConfig.root, ...config })
		},

		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID
			}
		},

		load(id) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				const registryPath = compiler.registryFilePath.replace(/\.ts$/, '')
				return `export { default } from '${registryPath}'`
			}
		},

		async buildStart() {
			await compiler.start()
		},

		configureServer(server) {
			server.watcher.on('change', (path) => {
				if (path === compiler.registryFilePath || path === compiler.metaFilePath) return
				if (path.endsWith('.tsx') || path.endsWith('.ts')) {
					compiler.debouncedRegenerate(path)
				}
			})

			server.watcher.on('add', (path) => {
				const relPath = relative(compiler.cwd, path)
				if (compiler.matchesStoryGlob(relPath) || compiler.matchesPageGlob(relPath)) {
					compiler.debouncedRegenerate(path)
				}
			})

			server.watcher.on('unlink', (path) => {
				const relPath = relative(compiler.cwd, path)
				if (compiler.matchesStoryGlob(relPath)) {
					compiler.evictTypeCache(path)
					compiler.debouncedRegenerate()
				}
				if (compiler.matchesPageGlob(relPath)) {
					compiler.debouncedRegenerate()
				}
			})
		},

		async buildEnd() {
			compiler.stop()
		},
	}
}
