import { createServer } from 'vite'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { StudioConfig, PropInfo } from '../types.js'
import { DEFAULT_PORT, LSP_POLL_INTERVAL } from '../types.js'
import { resolveBreakpoints } from '../config.js'
import { TsgoClient } from '../lsp/client.js'
import { findPreviewFiles, loadPreviewModules } from './scanner.js'
import { SSEManager } from './sse.js'
import { getHostHtml } from '../ui/host-html.js'
import { getFrameHtml } from '../ui/frame-html.js'

export interface DevServerOptions {
  cwd: string
  config: StudioConfig
  port?: number
}

export async function startDevServer(options: DevServerOptions): Promise<void> {
  const { cwd, config, port = DEFAULT_PORT } = options
  const include = config.preview.include ?? './src/components/**/*.preview.tsx'
  const breakpoints = resolveBreakpoints(config.preview.breakpoints)

  // 1. Start Vite (needed for ssrLoadModule)
  const vite = await createServer({
    root: cwd,
    server: { port, middlewareMode: true },
    optimizeDeps: {
      entries: [include],
    },
    appType: 'custom',
  })

  // 2. Find preview files
  console.log('[studio] Scanning preview files...')
  const files = await findPreviewFiles(cwd, include)
  console.log(`[studio] Found ${files.length} preview file(s)`)

  // 3. Start tsgo LSP
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

    // Initial type extraction — we need component names from modules first
  } catch (err) {
    console.warn('[studio] tsgo not available, running without type extraction')
    console.warn('[studio]', (err as Error).message)
  }

  // 4. Load preview modules via Vite SSR and build registry
  let registry = await loadPreviewModules(vite, files, cwd, typeMap)

  // Extract types for discovered components
  if (lspReady) {
    for (const entry of registry) {
      for (const file of files) {
        const props = await lspClient.getComponentProps(file, entry.name)
        if (props) {
          typeMap.set(entry.name, props)
        }
      }
    }
    // Rebuild with types
    registry = await loadPreviewModules(vite, files, cwd, typeMap)
  }

  console.log(`[studio] Registered ${registry.length} component(s)`)

  // 5. SSE manager
  const sse = new SSEManager()

  // 6. Build HTTP handler
  const { createServer: createHttpServer } = await import('node:http')
  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const pathname = url.pathname

    if (pathname === '/events') {
      sse.handleRequest(req, res)
      return
    }

    if (pathname === '/api/components') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify(registry))
      return
    }

    if (pathname.startsWith('/api/component/')) {
      const name = pathname.slice('/api/component/'.length)
      const entry = registry.find((c) => c.name === name)
      if (entry) {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify(entry))
      } else {
        res.writeHead(404)
        res.end('Not found')
      }
      return
    }

    if (pathname === '/frame') {
      const stylesPath = config.preview.styles
        ? resolve(cwd, config.preview.styles)
        : null
      const stylesExist = stylesPath && existsSync(stylesPath)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(getFrameHtml(stylesExist ? config.preview.styles! : null))
      return
    }

    if (pathname === '/' || pathname.match(/^\/[a-z0-9-]+\/[A-Za-z0-9]+$/)) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(getHostHtml({ breakpoints, port }))
      return
    }

    vite.middlewares(req, res)
  })

  // 7. LSP polling
  if (lspReady) {
    setInterval(async () => {
      let changed = false

      for (const entry of registry) {
        for (const file of files) {
          const props = await lspClient.getComponentProps(file, entry.name)
          if (!props) continue

          const existing = typeMap.get(entry.name)
          if (JSON.stringify(existing) !== JSON.stringify(props)) {
            typeMap.set(entry.name, props)
            changed = true
          }
        }
      }

      if (changed) {
        registry = await loadPreviewModules(vite, files, cwd, typeMap)
        sse.pushFullUpdate(registry)
      }
    }, LSP_POLL_INTERVAL)
  }

  // 8. Start listening
  server.listen(port, () => {
    console.log()
    console.log(`  Studio running at http://localhost:${port}`)
    console.log()
    for (const entry of registry) {
      for (const preview of entry.previews) {
        console.log(`  → /${entry.name}/${preview.name}`)
      }
    }
    console.log()
  })

  process.on('SIGINT', () => {
    console.log('\n[studio] Shutting down...')
    sse.disconnectAll()
    lspClient.stop()
    vite.close()
    server.close()
    process.exit(0)
  })
}
