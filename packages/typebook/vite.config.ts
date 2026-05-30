import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@react': resolve(__dirname, 'src/react'),
		},
	},
	build: {
		target: 'esnext',
		lib: {
			entry: {
				'index': resolve(__dirname, 'src/index.ts'),
				'react/index': resolve(__dirname, 'src/react/index.ts'),
				'plugins/vite': resolve(__dirname, 'src/plugins/vite.ts'),
				'plugins/rollup': resolve(__dirname, 'src/plugins/rollup.ts'),
				'plugins/rolldown': resolve(__dirname, 'src/plugins/rolldown.ts'),
				'plugins/webpack': resolve(__dirname, 'src/plugins/webpack.ts'),
				'plugins/rspack': resolve(__dirname, 'src/plugins/rspack.ts'),
				'plugins/esbuild': resolve(__dirname, 'src/plugins/esbuild.ts'),
				'plugins/farm': resolve(__dirname, 'src/plugins/farm.ts'),
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
				'unplugin',
				'webpack',
				'esbuild',
				'rollup',
				'fsevents',
				'typescript',
				'glob',
				'oxc-parser',
				'picomatch',
				'shiki',
				/^node:/,
				/^unplugin/,
				/^@oxc-parser/,
				/^@shikijs/,
				/^@tanstack\//,
				/^@rspack\//,
				/^@farmfe\//,
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
			exclude: ['src/**/__tests__/**'],
			outDir: 'dist',
			entryRoot: 'src',
		}),
	],
})
