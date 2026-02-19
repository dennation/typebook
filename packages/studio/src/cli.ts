import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { TypeScriptClient } from './core/ts-client.js'
import { findStoryFiles, analyzeStoryFile } from './core/scanner.js'
import { generateStudioGenFile } from './core/generator.js'
import {
  PACKAGE_NAME,
  LOG_PREFIX,
  DEFAULT_GEN_FILE,
  DEFAULT_INCLUDE,
} from './constants.js'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'generate') {
  const cwd = process.cwd()
  const includeArg = args.find((a) => a.startsWith('--include='))
  const include = includeArg
    ? includeArg.split('=')[1]
    : DEFAULT_INCLUDE

  const outputArg = args.find((a) => a.startsWith('--output='))
  const output = outputArg
    ? outputArg.split('=')[1]
    : DEFAULT_GEN_FILE

  console.log(LOG_PREFIX, 'Scanning story files...')
  const files = await findStoryFiles(cwd, include)
  console.log(LOG_PREFIX, `Found ${files.length} story file(s)`)

  // Start TypeScript client
  const lsp = new TypeScriptClient(cwd)
  let lspReady = false

  try {
    await lsp.start()
    lspReady = true
    console.log(LOG_PREFIX, 'TypeScript client started')

  } catch (err) {
    console.warn(LOG_PREFIX, 'TypeScript client not available, generating without types')
    console.warn(LOG_PREFIX, (err as Error).message)
  }

  // Analyze and extract types
  const fileInfos = await Promise.all(
    files.map(async (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const analysis = analyzeStoryFile(content)
      let props: import('./types.js').PropInfo[] = []
      if (lspReady) {
        const extracted = await lsp.getComponentProps(filePath)
        if (extracted) props = extracted
      }
      return { filePath, analysis, props }
    }),
  )

  // Generate .gen file
  const genFilePath = resolve(cwd, output)
  const content = generateStudioGenFile(fileInfos, genFilePath)
  writeFileSync(genFilePath, content, 'utf-8')
  console.log(LOG_PREFIX, `Generated ${output}`)

  lsp.stop()
} else {
  console.log(`
  @dennation/${PACKAGE_NAME}

  Commands:
    generate    Generate ${DEFAULT_GEN_FILE} from .stories.tsx files

  Options:
    --include=GLOB   Story files glob pattern (default: ${DEFAULT_INCLUDE})
    --output=PATH    Output path for generated file (default: ${DEFAULT_GEN_FILE})

  Usage:
    npx @dennation/${PACKAGE_NAME} generate
`)
}
