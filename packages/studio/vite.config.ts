import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		target: 'esnext',
		lib: {
			entry: {
				'api/index': resolve(__dirname, 'src/index.ts'),
				'runtime/index': resolve(__dirname, 'src/resolve.ts'),
				'react/index': resolve(__dirname, 'src/react/index.ts'),
				'plugin/vite': resolve(__dirname, 'src/plugins/vite/index.ts'),
				'cli/index': resolve(__dirname, 'src/cli.ts'),
			},
			formats: ['es'],
		},
		rollupOptions: {
			external: [
				'react',
				'react-dom',
				'react/jsx-runtime',
				'vite',
				'fsevents',
				'@typescript/native-preview',
				'glob',
				'oxc-parser',
				'picomatch',
				/^node:/,
				/^@oxc-parser/,
			],
			output: {
				entryFileNames: '[name].mjs',
				chunkFileNames: '[name]-[hash].mjs',
			},
		},
		outDir: 'dist',
		emptyOutDir: true,
	},
	plugins: [
		dts({
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			outDir: 'dist',
			entryRoot: 'src',
			copyDtsFiles: true,
			afterBuild: async () => {
				// Move declaration files to match entry points
				const { renameSync, existsSync, mkdirSync } = await import('node:fs')
				const moves = [
					['dist/index.d.ts', 'dist/api/index.d.mts'],
					['dist/resolve.d.ts', 'dist/runtime/index.d.mts'],
					['dist/react/index.d.ts', 'dist/react/index.d.mts'],
					['dist/plugins/vite/index.d.ts', 'dist/plugin/vite.d.mts'],
					['dist/cli.d.ts', 'dist/cli/index.d.mts'],
				]
				for (const [from, to] of moves) {
					if (existsSync(from)) {
						const dir = to.substring(0, to.lastIndexOf('/'))
						if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
						renameSync(from, to)
					}
				}
			},
		}),
	],
})
