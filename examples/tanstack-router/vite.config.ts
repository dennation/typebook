import { snippets } from "@dennation/typebook/plugins/snippets";
import { typebook } from "@dennation/typebook/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			routesDirectory: "./src/pages",
			generatedRouteTree: "./src/route-tree.gen.ts",
			autoCodeSplitting: true,
		}),
		typebook({ plugins: [snippets()] }),
		react(),
	],
});
