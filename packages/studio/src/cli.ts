import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { TypeScriptClient } from './core/ts-client.js'
import { findStoryFiles, findPageFiles, analyzeStoryFile, analyzePageFile } from './core/scanner.js'
import { generateRegistryFile, generateMetaFile } from './core/generator.js'
import {
  PACKAGE_NAME,
  LOG_PREFIX,
  DEFAULT_REGISTRY_FILE,
  DEFAULT_META_FILE,
  DEFAULT_INCLUDE,
  DEFAULT_PAGES_INCLUDE,
} from './constants.js'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'generate') {
  const cwd = process.cwd()
  const includeArg = args.find((a) => a.startsWith('--include='))
  const include = includeArg
    ? includeArg.split('=')[1]
    : DEFAULT_INCLUDE

  const includePagesArg = args.find((a) => a.startsWith('--include-pages='))
  const includePages = includePagesArg
    ? includePagesArg.split('=')[1]
    : DEFAULT_PAGES_INCLUDE

  const outputArg = args.find((a) => a.startsWith('--output='))
  const registryOutput = outputArg
    ? outputArg.split('=')[1]
    : DEFAULT_REGISTRY_FILE

  const metaOutputArg = args.find((a) => a.startsWith('--meta-output='))
  const metaOutput = metaOutputArg
    ? metaOutputArg.split('=')[1]
    : DEFAULT_META_FILE

  console.log(LOG_PREFIX, 'Scanning story files...')
  const files = await findStoryFiles(cwd, include)
  console.log(LOG_PREFIX, `Found ${files.length} story file(s)`)

  console.log(LOG_PREFIX, 'Scanning page files...')
  const pages = await findPageFiles(cwd, includePages)
  console.log(LOG_PREFIX, `Found ${pages.length} page file(s)`)

  // Start TypeScript client
  const tsClient = new TypeScriptClient(cwd)
  let tsClientReady = false

  try {
    await tsClient.start()
    tsClientReady = true
    console.log(LOG_PREFIX, 'TypeScript client started')

  } catch (err) {
    console.warn(LOG_PREFIX, 'TypeScript client not available, generating without types')
    console.warn(LOG_PREFIX, (err as Error).message)
  }

  // Analyze and extract types
  const fileInfos = await Promise.all(
    files.map(async (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const analysis = await analyzeStoryFile(content)
      let props: import('./types.js').PropInfo[] = []
      if (tsClientReady) {
        const extracted = await tsClient.getComponentProps(filePath)
        if (extracted) props = extracted
      }
      return { filePath, analysis, props }
    }),
  )

  // Analyze page files
  const pageInfos = await Promise.all(
    pages.map(async (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const analysis = await analyzePageFile(content)
      return { filePath, analysis }
    }),
  )

  // Generate meta file
  const metaFilePath = resolve(cwd, metaOutput)
  const metaContent = generateMetaFile(fileInfos, cwd)
  writeFileSync(metaFilePath, metaContent, 'utf-8')
  console.log(LOG_PREFIX, `Generated ${metaOutput}`)

  // Generate registry file
  const registryFilePath = resolve(cwd, registryOutput)
  const registryContent = generateRegistryFile(fileInfos, pageInfos, registryFilePath, metaFilePath, cwd)
  writeFileSync(registryFilePath, registryContent, 'utf-8')
  console.log(LOG_PREFIX, `Generated ${registryOutput}`)

  tsClient.stop()
} else {
  console.log(`
  @dennation/${PACKAGE_NAME}

  Commands:
    generate    Generate registry and meta gen files from .stories.tsx and .docs.tsx files

  Options:
    --include=GLOB            Story files glob pattern (default: ${DEFAULT_INCLUDE})
    --include-pages=GLOB      Page files glob pattern (default: ${DEFAULT_PAGES_INCLUDE})
    --output=PATH             Output path for registry file (default: ${DEFAULT_REGISTRY_FILE})
    --meta-output=PATH        Output path for meta file (default: ${DEFAULT_META_FILE})

  Usage:
    npx @dennation/${PACKAGE_NAME} generate
`)
}
