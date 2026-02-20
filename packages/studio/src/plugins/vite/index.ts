import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import picomatch from 'picomatch'
import type { Plugin } from 'vite'
import type { VitePluginConfig, PropInfo } from '../../types.js'
import { TypeScriptClient } from '../../core/ts-client.js'
import { findStoryFiles, analyzeStoryFile } from '../../core/scanner.js'
import { generateRegistryFile, generateMetaFile } from '../../core/generator.js'
import {
  PACKAGE_NAME,
  LOG_PREFIX,
  DEFAULT_REGISTRY_FILE,
  DEFAULT_META_FILE,
  DEFAULT_INCLUDE,
  VIRTUAL_MODULE_ID,
} from '../../constants.js'

const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function uiStudio(config?: VitePluginConfig): Plugin {
  const include = config?.include ?? DEFAULT_INCLUDE
  const registryOutput = config?.output ?? DEFAULT_REGISTRY_FILE
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
      typeCache.delete(changedFile)
    } else {
      typeCache.clear()
    }
  }

  async function regenerateGenFiles(): Promise<void> {
    const files = await Promise.all(
      storyFiles.map(async (filePath) => {
        const content = readFileSync(filePath, 'utf-8')
        const analysis = analyzeStoryFile(content)
        const props = await extractTypes(filePath)
        return { filePath, analysis, props }
      }),
    )

    const registryFilePath = resolve(cwd, registryOutput)
    const metaFilePath = resolve(cwd, DEFAULT_META_FILE)

    // Generate meta file first (registry imports it)
    const metaContent = generateMetaFile(files, cwd)
    writeIfChanged(metaFilePath, metaContent)

    // Generate registry file
    const registryContent = generateRegistryFile(files, registryFilePath, metaFilePath, cwd)
    writeIfChanged(registryFilePath, registryContent)
  }

  function writeIfChanged(filePath: string, content: string): void {
    const existing = existsSync(filePath)
      ? readFileSync(filePath, 'utf-8')
      : ''
    if (content !== existing) {
      writeFileSync(filePath, content, 'utf-8')
    }
  }

  function debouncedRegenerate(changedFile?: string): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        storyFiles = await findStoryFiles(cwd, include)

        if (lsp && lspReady && changedFile) {
          invalidateTypeCache(changedFile)
          await lsp.notifyChange(changedFile)
        }

        await regenerateGenFiles()
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
        const registryPath = resolve(cwd, registryOutput).replace(/\.ts$/, '')
        return `export { default } from '${registryPath}'`
      }
    },

    async buildStart() {
      storyFiles = await findStoryFiles(cwd, include)
      console.log(LOG_PREFIX, `Found ${storyFiles.length} story file(s)`)

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

      await regenerateGenFiles()
      console.log(LOG_PREFIX, `Generated ${registryOutput} and ${DEFAULT_META_FILE}`)
    },

    configureServer(server) {
      const registryFilePath = resolve(cwd, registryOutput)
      const metaFilePath = resolve(cwd, DEFAULT_META_FILE)

      server.watcher.on('change', (path) => {
        if (path === registryFilePath || path === metaFilePath) return
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
