import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { uiStudio } from "@dennation/ui-studio/vite";

export default defineConfig({
	plugins: [tailwindcss(), react(), uiStudio()],
});
