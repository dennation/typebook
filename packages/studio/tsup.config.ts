import { defineConfig } from 'tsup'

export default defineConfig([
  // Main API — define(), types (consumed by .stories.tsx)
  {
    entry: { 'api/index': 'src/api/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // Runtime — resolveStories() (consumed by studio.gen.ts)
  {
    entry: { 'runtime/index': 'src/runtime/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // React — <Studio /> component (consumed by user's page or /__studio)
  {
    entry: { 'react/index': 'src/react/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // Vite plugin (consumed by vite.config.ts)
  {
    entry: { 'plugin/vite': 'src/plugins/vite/index.ts' },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['vite', 'fsevents', 'esbuild', '@typescript/native-preview'],
  },
  // CLI
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    banner: { js: '#!/usr/bin/env node' },
    external: ['vite', 'fsevents', 'bundle-require', 'esbuild', '@typescript/native-preview'],
  },
])
