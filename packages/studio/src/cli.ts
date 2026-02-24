import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { TypeScriptClient } from './core/ts-client.js'
import { findFiles, analyzeStoryFile, analyzePageFile } from './core/scanner.js'
import { generateRegistryFile, generateMetaFile } from './core/generator.js'
import {
  PACKAGE_NAME,
  LOG_PREFIX,
  DEFAULT_REGISTRY_FILE,
  DEFAULT_META_FILE,
  DEFAULT_STORIES_GLOB,
  DEFAULT_PAGES_GLOB,
} from './constants.js'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'generate') {
  const cwd = process.cwd()
  const storiesArg = args.find((a) => a.startsWith('--stories='))
  const storiesGlob = storiesArg
    ? storiesArg.split('=')[1]
    : DEFAULT_STORIES_GLOB

  const pagesArg = args.find((a) => a.startsWith('--pages='))
  const pagesGlob = pagesArg
    ? pagesArg.split('=')[1]
    : DEFAULT_PAGES_GLOB

  const outputArg = args.find((a) => a.startsWith('--output='))
  const registryOutput = outputArg
    ? outputArg.split('=')[1]
    : DEFAULT_REGISTRY_FILE

  const metaOutputArg = args.find((a) => a.startsWith('--meta-output='))
  const metaOutput = metaOutputArg
    ? metaOutputArg.split('=')[1]
    : DEFAULT_META_FILE

  const files = await findFiles(cwd, storiesGlob)
  console.log(LOG_PREFIX, `Found ${files.length} story file(s)`)

  const pages = await findFiles(cwd, pagesGlob)
  console.log(LOG_PREFIX, `Found ${pages.length} page file(s)`)

  // Start TypeScript client
  let tsClient: TypeScriptClient | null = null

  try {
    const client = new TypeScriptClient(cwd)
    await client.start()
    tsClient = client
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
      const props = tsClient ? (await tsClient.getComponentProps(filePath)) ?? [] : []
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

  tsClient?.stop()
} else {
  console.log(`
  @dennation/${PACKAGE_NAME}

  Commands:
    generate    Generate registry and meta gen files from .stories.tsx and .page.tsx files

  Options:
    --stories=GLOB            Story files glob pattern (default: ${DEFAULT_STORIES_GLOB})
    --pages=GLOB              Page files glob pattern (default: ${DEFAULT_PAGES_GLOB})
    --output=PATH             Output path for registry file (default: ${DEFAULT_REGISTRY_FILE})
    --meta-output=PATH        Output path for meta file (default: ${DEFAULT_META_FILE})

  Usage:
    npx @dennation/${PACKAGE_NAME} generate
`)
}
