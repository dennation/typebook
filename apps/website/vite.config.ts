import { typebook } from "@dennation/typebook/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	// GitHub Pages serves the site from /<repo>/ — CI sets VITE_BASE=/typebook/
	base: process.env.VITE_BASE ?? "/",
	plugins: [
		tanstackRouter({
			target: "react",
			routesDirectory: "./src/pages",
			generatedRouteTree: "./src/route-tree.gen.ts",
			autoCodeSplitting: true,
		}),
		// Scans the docs pages for <Snippet> blocks and writes src/snippets.gen.ts,
		// the source map that the "show source" toggle reads from at runtime.
		typebook(),
		react(),
		tailwindcss(),
	],
});
