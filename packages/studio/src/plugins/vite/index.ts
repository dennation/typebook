import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin, ViteDevServer } from 'vite'
import type { VitePluginConfig, PropInfo } from '../../types.js'
import { TsgoClient } from '../../core/lsp-client.js'
import { findStoryFiles, analyzeStoryFile } from '../../core/scanner.js'
import { generateStudioGenFile } from '../../core/generator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_INCLUDE = './src/**/*.stories.tsx'
const DEFAULT_ROUTE = '/__studio'

export function studioPlugin(config?: VitePluginConfig): Plugin {
  const include = config?.include ?? DEFAULT_INCLUDE
  const route = config?.route ?? DEFAULT_ROUTE

  let cwd: string
  let lsp: TsgoClient | null = null
  let lspReady = false
  let storyFiles: string[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let server: ViteDevServer | undefined

  async function extractTypes(filePath: string): Promise<PropInfo[]> {
    if (!lsp || !lspReady) return []
    const props = await lsp.getComponentProps(filePath)
    return props ?? []
  }

  async function regenerateGenFile(): Promise<void> {
    const files = await Promise.all(
      storyFiles.map(async (filePath) => {
        const content = readFileSync(filePath, 'utf-8')
        const analysis = analyzeStoryFile(content)
        const props = await extractTypes(filePath)
        return { filePath, analysis, props }
      }),
    )

    const genFilePath = resolve(cwd, 'studio.gen.ts')
    const content = generateStudioGenFile(files, genFilePath)

    // Only write if content changed to avoid unnecessary HMR
    const existing = existsSync(genFilePath)
      ? readFileSync(genFilePath, 'utf-8')
      : ''
    if (content !== existing) {
      writeFileSync(genFilePath, content, 'utf-8')
    }
  }

  function debouncedRegenerate(changedFile?: string): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        // Re-scan for new/deleted files
        storyFiles = await findStoryFiles(cwd, include)

        // Notify LSP about the changed file
        if (lsp && lspReady && changedFile) {
          await lsp.notifyChange(changedFile)
        }

        await regenerateGenFile()
      } catch (err) {
        console.error('[studio] Failed to regenerate:', err)
      }
    }, 200)
  }

  return {
    name: 'studio',

    configResolved(resolvedConfig) {
      cwd = resolvedConfig.root
    },

    async buildStart() {
      // 1. Find story files
      storyFiles = await findStoryFiles(cwd, include)
      console.log(`[studio] Found ${storyFiles.length} story file(s)`)

      // 2. Start LSP
      lsp = new TsgoClient(cwd)
      try {
        await lsp.start()
        lspReady = true
        console.log('[studio] tsgo LSP started')

        // Open all story files
        for (const file of storyFiles) {
          await lsp.openFile(file)
        }
      } catch (err) {
        console.warn('[studio] tsgo not available, running without type extraction')
        console.warn('[studio]', (err as Error).message)
      }

      // 3. Generate initial .gen file
      await regenerateGenFile()
      console.log('[studio] Generated studio.gen.ts')
    },

    configureServer(viteServer) {
      server = viteServer

      // Watch for file changes
      server.watcher.on('change', (changedPath) => {
        if (changedPath.endsWith('.gen.ts')) return
        if (
          changedPath.endsWith('.stories.tsx') ||
          changedPath.endsWith('.tsx') ||
          changedPath.endsWith('.ts')
        ) {
          debouncedRegenerate(changedPath)
        }
      })

      // Watch for new/deleted story files
      server.watcher.on('add', (path) => {
        if (path.endsWith('.stories.tsx')) {
          debouncedRegenerate(path)
        }
      })

      server.watcher.on('unlink', (path) => {
        if (path.endsWith('.stories.tsx')) {
          debouncedRegenerate()
        }
      })

      // Serve /__studio route
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`)

        if (url.pathname === route) {
          const studioHtml = getStudioHtml(cwd, route)
          server!
            .transformIndexHtml(url.pathname, studioHtml)
            .then((html) => {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(html)
            })
            .catch(next)
          return
        }

        next()
      })
    },

    async buildEnd() {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (lsp) {
        lsp.stop()
        lsp = null
        lspReady = false
      }
    },
  }
}

function getStudioHtml(cwd: string, route: string): string {
  // Virtual HTML that imports the Studio component and registry
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studio</title>
</head>
<body>
  <div id="studio-root"></div>
  <script type="module">
    import { createRoot } from 'react-dom/client'
    import { createElement } from 'react'
    import { Studio } from '@dennation/studio/react'
    import registry from './studio.gen'

    const root = createRoot(document.getElementById('studio-root'))
    root.render(createElement(Studio, { registry }))
  </script>
</body>
</html>`
}
