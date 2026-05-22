import type { Plugin } from 'vite'
import { PACKAGE_NAME } from '../../constants.js'
import { RegistryBuilder } from '../../core/registry.js'
import type { TypebookConfig } from '../../types.js'

export function typebook(config?: TypebookConfig): Plugin {
	let builder: RegistryBuilder

	return {
		name: PACKAGE_NAME,

		configResolved(resolvedConfig) {
			builder = new RegistryBuilder({ cwd: resolvedConfig.root, ...config })
		},

		async buildStart() {
			await builder.start()
		},

		configureServer(server) {
			const isGenFile = (path: string) => path === builder.registryFilePath

			const isWatchedSource = (path: string) => {
				if (isGenFile(path)) return false
				return builder.isSourceFile(path)
			}

			server.watcher.on('change', (path) => {
				if (isWatchedSource(path)) builder.scheduleFileChange(path)
			})

			server.watcher.on('add', (path) => {
				if (isWatchedSource(path)) builder.scheduleFileChange(path)
			})

			server.watcher.on('unlink', (path) => {
				if (isWatchedSource(path)) builder.onFileRemoved(path)
			})
		},

		async buildEnd() {
			builder.stop()
		},
	}
}
