import { defineConfig } from 'tsup'

export default defineConfig([
  // Library — API, runtime, React component
  {
    entry: {
      'api/index': 'src/api/index.ts',
      'runtime/index': 'src/core/resolve.ts',
      'react/index': 'src/react/index.ts',
    },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // Vite plugin + CLI (Node tools)
  {
    entry: {
      'plugin/vite': 'src/plugins/vite/index.ts',
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    external: ['vite', 'fsevents', 'bundle-require', 'esbuild', '@typescript/native-preview'],
  },
])
