import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		target: "esnext",
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				"plugins/llm-instructions/index": resolve(
					__dirname,
					"src/plugins/llm-instructions/index.ts",
				),
				"plugins/vite": resolve(__dirname, "src/plugins/vite.ts"),
				"plugins/rollup": resolve(__dirname, "src/plugins/rollup.ts"),
				"plugins/rolldown": resolve(__dirname, "src/plugins/rolldown.ts"),
				"plugins/webpack": resolve(__dirname, "src/plugins/webpack.ts"),
				"plugins/rspack": resolve(__dirname, "src/plugins/rspack.ts"),
				"plugins/esbuild": resolve(__dirname, "src/plugins/esbuild.ts"),
				"plugins/farm": resolve(__dirname, "src/plugins/farm.ts"),
				"cli/index": resolve(__dirname, "src/cli.ts"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			// The only runtime imports: the peer `typescript`, the `tinyglobby` glob, and `unplugin`
			// (+ its submodules) — everything else the plugins touch is provided by the host bundler.
			external: ["typescript", "tinyglobby", /^node:/, /^unplugin/],
			output: {
				entryFileNames: "[name].mjs",
				chunkFileNames: "[name]-[hash].mjs",
			},
		},
		outDir: "dist",
		emptyOutDir: true,
	},
	plugins: [
		dts({
			include: ["src/**/*.ts"],
			exclude: ["src/**/__tests__/**"],
			outDir: "dist",
			entryRoot: "src",
		}),
	],
});
