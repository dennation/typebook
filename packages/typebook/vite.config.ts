import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		target: 'esnext',
		lib: {
			entry: {
				'index': resolve(__dirname, 'src/index.ts'),
				'react/index': resolve(__dirname, 'src/react/index.ts'),
				'plugins/vite': resolve(__dirname, 'src/plugins/vite/index.ts'),
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
				'typescript',
				'glob',
				'oxc-parser',
				'picomatch',
				'shiki',
				/^node:/,
				/^@oxc-parser/,
				/^@shikijs/,
				/^@tanstack\//,
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
		tailwindcss(),
		dts({
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			outDir: 'dist',
			entryRoot: 'src',
		}),
	],
})
