import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	// GitHub Pages serves the site from /<repo>/ — CI sets VITE_BASE=/typebook/
	base: process.env.VITE_BASE ?? "/",
	plugins: [react(), tailwindcss()],
});
