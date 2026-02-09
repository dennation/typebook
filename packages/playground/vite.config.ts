import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { studioPlugin } from '@dennation/studio/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    studioPlugin({
      include: './src/components/**/*.stories.tsx',
      styles: ['./src/styles.css'],
    }),
  ],
})
