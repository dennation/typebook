import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import picomatch from 'picomatch'
import type { Plugin } from 'vite'
import type { VitePluginConfig, PropInfo } from '../../types.js'
import { TypeScriptClient } from '../../core/ts-client.js'
import { findStoryFiles, analyzeStoryFile } from '../../core/scanner.js'
import { generateStudioGenFile } from '../../core/generator.js'
import {
  PACKAGE_NAME,
  LOG_PREFIX,
  DEFAULT_GEN_FILE,
  DEFAULT_INCLUDE,
  VIRTUAL_MODULE_ID,
} from '../../constants.js'

const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function uiStudio(config?: VitePluginConfig): Plugin {
  const include = config?.include ?? DEFAULT_INCLUDE
  const output = config?.output ?? DEFAULT_GEN_FILE
  const isStoryFile = picomatch(include)

  let cwd: string
  let lsp: TypeScriptClient | null = null
  let lspReady = false
  let storyFiles: string[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // PropInfo cache — avoids redundant type extraction for unchanged files
  const typeCache = new Map<string, PropInfo[]>()

  async function extractTypes(filePath: string): Promise<PropInfo[]> {
    if (!lsp || !lspReady) return []

    const cached = typeCache.get(filePath)
    if (cached) return cached

    const props = await lsp.getComponentProps(filePath)
    const result = props ?? []
    typeCache.set(filePath, result)
    return result
  }

  function invalidateTypeCache(changedFile: string): void {
    const relChanged = relative(cwd, changedFile)
    if (isStoryFile(relChanged)) {
      // Story file changed — invalidate only that file
      typeCache.delete(changedFile)
    } else {
      // Non-story file (component, util, etc.) — could affect any story's types
      typeCache.clear()
    }
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

        if (lsp && lspReady && changedFile) {
          // Invalidate cached types for affected files
          invalidateTypeCache(changedFile)
          // Incremental rebuild — TS reuses unchanged source files
          await lsp.notifyChange(changedFile)
        }

        await regenerateGenFile()
      } catch (err) {
        console.error(LOG_PREFIX, 'Failed to regenerate:', err)
      }
    }, 200)
  }

  return {
    name: PACKAGE_NAME,

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
      console.log(LOG_PREFIX, `Found ${storyFiles.length} story file(s)`)

      // 2. Start TypeScript client
      const client = new TypeScriptClient(cwd)
      try {
        await client.start()
        lsp = client
        lspReady = true
        console.log(LOG_PREFIX, 'TypeScript client started')

      } catch (err) {
        console.warn(LOG_PREFIX, 'TypeScript client not available, running without type extraction')
        console.warn(LOG_PREFIX, (err as Error).message)
      }

      // 3. Generate initial .gen file
      await regenerateGenFile()
      console.log(LOG_PREFIX, `Generated ${output}`)
    },

    configureServer(server) {
      const genFilePath = resolve(cwd, output)

      server.watcher.on('change', (path) => {
        if (path === genFilePath) return
        // Regenerate on any TS/TSX change (types may affect story props)
        if (path.endsWith('.tsx') || path.endsWith('.ts')) {
          debouncedRegenerate(path)
        }
      })

      server.watcher.on('add', (path) => {
        const relPath = relative(cwd, path)
        if (isStoryFile(relPath)) {
          debouncedRegenerate(path)
        }
      })

      server.watcher.on('unlink', (path) => {
        const relPath = relative(cwd, path)
        if (isStoryFile(relPath)) {
          typeCache.delete(path)
          debouncedRegenerate()
        }
      })
    },

    async buildEnd() {
      if (debounceTimer) clearTimeout(debounceTimer)
      typeCache.clear()
      if (lsp) {
        lsp.stop()
        lsp = null
        lspReady = false
      }
    },
  }
}
