import { defineConfig } from '@dennation/studio'

export default defineConfig({
  preview: {
    styles: './src/styles.css',
    include: './src/components/**/*.preview.tsx',
    breakpoints: true,
  },
})
