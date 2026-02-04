import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { 'api/index': 'src/api/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    banner: { js: '#!/usr/bin/env node' },
    external: ['vite', 'fsevents', 'bundle-require', 'esbuild', '@typescript/native-preview'],
  },
])
