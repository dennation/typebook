import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StudioConfig, PropInfo } from '../types.js'
import { DEFAULT_PORT } from '../types.js'
import { resolveBreakpoints } from '../config.js'
import { TsgoClient } from '../lsp/client.js'
import { findPreviewFiles, loadPreviewModules } from './scanner.js'
import { SSEManager } from './sse.js'
import { studioPlugin } from './vite-plugin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface DevServerOptions {
  cwd: string
  config: StudioConfig
  port?: number
}

export async function startDevServer(options: DevServerOptions): Promise<void> {
  const { cwd, config, port = DEFAULT_PORT } = options
  const include = config.preview.include ?? './src/components/**/*.preview.tsx'
  const breakpoints = resolveBreakpoints(config.preview.breakpoints)
  const stylesPath = config.preview.styles
    ? resolve(cwd, config.preview.styles)
    : null

  const clientDir = resolve(__dirname, '../../client')

  // 1. SSE manager (needed before Vite starts for plugin)
  const sse = new SSEManager()

  // 2. Create Vite dev server with studio plugin
  const vite = await createServer({
    root: clientDir,
    server: {
      port,
      fs: { allow: [clientDir, cwd] },
    },
    plugins: [
      react(),
      studioPlugin({
        getRegistry: () => registry,
        sse,
        breakpoints,
        port,
        stylesPath,
        clientDir,
      }),
    ],
  })

  // 3. Find preview files
  console.log('[studio] Scanning preview files...')
  const files = await findPreviewFiles(cwd, include)
  console.log(`[studio] Found ${files.length} preview file(s)`)

  // 4. Start tsgo LSP
  const lspClient = new TsgoClient(cwd)
  let lspReady = false
  const typeMap = new Map<string, PropInfo[]>()

  try {
    await lspClient.start()
    lspReady = true
    console.log('[studio] tsgo LSP started')

    for (const file of files) {
      await lspClient.openFile(file)
    }
  } catch (err) {
    console.warn('[studio] tsgo not available, running without type extraction')
    console.warn('[studio]', (err as Error).message)
  }

  // 5. Extract types in parallel, then build registry once
  if (lspReady) {
    const results = await Promise.all(
      files.map(async (file) => {
        const props = await lspClient.getComponentProps(file)
        return props ? ([file, props] as const) : null
      }),
    )
    for (const result of results) {
      if (result) typeMap.set(result[0], result[1])
    }
  }

  let registry = await loadPreviewModules(vite, files, cwd, typeMap)
  console.log(`[studio] Registered ${registry.length} component(s)`)

  // 6. Watch for file changes instead of polling
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  if (lspReady) {
    vite.watcher.on('change', (changedPath) => {
      // Only react to files in the preview scope or their component sources
      const isPreviewFile = files.some((f) => changedPath.endsWith(f) || changedPath === f)
      const isSourceFile = changedPath.endsWith('.tsx') || changedPath.endsWith('.ts')
      if (!isPreviewFile && !isSourceFile) return

      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        // Notify LSP about changed files and re-extract types
        for (const file of files) {
          await lspClient.notifyChange(file)
        }

        let changed = false
        for (const file of files) {
          const props = await lspClient.getComponentProps(file)
          if (!props) continue

          const existing = typeMap.get(file)
          if (JSON.stringify(existing) !== JSON.stringify(props)) {
            typeMap.set(file, props)
            changed = true
          }
        }

        if (changed) {
          registry = await loadPreviewModules(vite, files, cwd, typeMap)
          sse.pushFullUpdate(registry)
        }
      }, 200)
    })
  }

  // 7. Start listening
  await vite.listen()

  console.log()
  console.log(`  Studio running at http://localhost:${port}`)
  console.log()
  for (const entry of registry) {
    for (const preview of entry.previews) {
      console.log(`  → /${entry.name}/${preview.name}`)
    }
  }
  console.log()

  // 8. Graceful shutdown
  const shutdown = async () => {
    console.log('\n[studio] Shutting down...')
    if (debounceTimer) clearTimeout(debounceTimer)
    sse.disconnectAll()
    lspClient.stop()
    await vite.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
