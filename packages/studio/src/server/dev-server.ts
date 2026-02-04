import { createServer, type ViteDevServer } from 'vite'
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import type { StudioConfig, ComponentEntry, PropInfo } from '../types.js'
import { DEFAULT_PORT, LSP_POLL_INTERVAL } from '../types.js'
import { resolveBreakpoints } from '../config.js'
import { TsgoClient } from '../lsp/client.js'
import { scanPreviewFiles, buildRegistry } from './scanner.js'
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
  const breakpoints = resolveBreakpoints(config.preview.breakpoints)

  // 1. Scan preview files
  console.log('[studio] Scanning preview files...')
  const parsed = await scanPreviewFiles(cwd, config.preview.include)
  console.log(`[studio] Found ${parsed.length} preview file(s)`)

  // 2. Start tsgo LSP
  const lspClient = new TsgoClient(cwd)
  let lspReady = false
  const typeMap = new Map<string, PropInfo[]>()

  try {
    await lspClient.start()
    lspReady = true
    console.log('[studio] tsgo LSP started')

    // Open all preview files
    for (const file of parsed) {
      await lspClient.openFile(file.filePath)
    }

    // Initial type extraction
    for (const file of parsed) {
      for (const setup of file.setups) {
        const props = await lspClient.getComponentProps(
          file.filePath,
          setup.componentName,
        )
        if (props) {
          typeMap.set(setup.componentName, props)
        }
      }
    }
  } catch (err) {
    console.warn('[studio] tsgo not available, running without type extraction')
    console.warn('[studio]', (err as Error).message)
  }

  // 3. Build component registry
  let registry = buildRegistry(cwd, parsed, typeMap)
  console.log(`[studio] Registered ${registry.length} component(s)`)

  // 4. SSE manager
  const sse = new SSEManager()

  // 5. Start Vite
  const vite = await createServer({
    root: cwd,
    server: { port, middlewareMode: true },
    optimizeDeps: {
      entries: [config.preview.include],
    },
    appType: 'custom',
  })

  // 6. Build HTTP handler
  const { createServer: createHttpServer } = await import('node:http')
  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const pathname = url.pathname

    // SSE endpoint
    if (pathname === '/events') {
      sse.handleRequest(req, res)
      return
    }

    // API: list components
    if (pathname === '/api/components') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify(registry))
      return
    }

    // API: single component
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

    // Frame HTML (rendered inside iframe)
    if (pathname === '/frame') {
      const stylesPath = resolve(cwd, config.preview.styles)
      const stylesExist = existsSync(stylesPath)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(getFrameHtml(stylesExist ? config.preview.styles : null))
      return
    }

    // Host HTML (main app shell)
    if (pathname === '/' || pathname.match(/^\/[a-z0-9-]+\/[A-Za-z0-9]+$/)) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(
        getHostHtml({
          breakpoints,
          port,
        }),
      )
      return
    }

    // Fallthrough to Vite for module requests
    vite.middlewares(req, res)
  })

  // 7. LSP polling
  if (lspReady) {
    setInterval(async () => {
      let changed = false

      for (const file of parsed) {
        for (const setup of file.setups) {
          const props = await lspClient.getComponentProps(
            file.filePath,
            setup.componentName,
          )
          if (!props) continue

          const existing = typeMap.get(setup.componentName)
          if (JSON.stringify(existing) !== JSON.stringify(props)) {
            typeMap.set(setup.componentName, props)
            changed = true
          }
        }
      }

      if (changed) {
        registry = buildRegistry(cwd, parsed, typeMap)
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

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n[studio] Shutting down...')
    sse.disconnectAll()
    lspClient.stop()
    vite.close()
    server.close()
    process.exit(0)
  })
}
