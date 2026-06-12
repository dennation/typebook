import { typebook } from "@dennation/typebook/vite";
import mdx from "@mdx-js/rollup";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		mdx(),
		tanstackRouter({
			target: "react",
			routesDirectory: "./src/pages",
			generatedRouteTree: "./src/route-tree.gen.ts",
			autoCodeSplitting: true,
		}),
		typebook(),
		react(),
	],
});
