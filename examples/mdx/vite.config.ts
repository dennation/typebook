import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { uiStudio } from "@dennation/ui-studio/vite";

export default defineConfig({
	plugins: [mdx(), react(), uiStudio()],
});
