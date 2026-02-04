import { defineConfig } from '@dennation/studio'

export default defineConfig({
  preview: {
    include: './src/components/**/*.preview.tsx',
    breakpoints: true,
  },
})
