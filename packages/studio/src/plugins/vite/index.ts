import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { VitePluginConfig, PropInfo } from '../../types.js'
import { TsgoClient } from '../../core/lsp-client.js'
import { findStoryFiles, analyzeStoryFile } from '../../core/scanner.js'
import { generateStudioGenFile } from '../../core/generator.js'
import studioHtml from './studio.html'

const DEFAULT_INCLUDE = './src/**/*.stories.tsx'
const DEFAULT_ROUTE = '/__studio'
const DEFAULT_OUTPUT = './studio.gen.ts'

const VIRTUAL_MODULE_ID = 'virtual:studio-registry'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function studioPlugin(config?: VitePluginConfig): Plugin {
  const include = config?.include ?? DEFAULT_INCLUDE
  const route = config?.route ?? DEFAULT_ROUTE
  const output = config?.output ?? DEFAULT_OUTPUT

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

    const genFilePath = resolve(cwd, output)
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

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const genPath = resolve(cwd, output).replace(/\.ts$/, '')
        return `export { default } from '${genPath}'`
      }
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
      console.log(`[studio] Generated ${output}`)
    },

    configureServer(viteServer) {
      server = viteServer

      // Watch for file changes
      server.watcher.on('change', (changedPath) => {
        if (changedPath === resolve(cwd, output)) return
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
