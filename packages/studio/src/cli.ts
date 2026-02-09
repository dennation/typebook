import { resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { TsgoClient } from './core/lsp-client.js'
import { findStoryFiles, analyzeStoryFile } from './core/scanner.js'
import { generateStudioGenFile } from './core/generator.js'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'generate') {
  const cwd = process.cwd()
  const includeArg = args.find((a) => a.startsWith('--include='))
  const include = includeArg
    ? includeArg.split('=')[1]
    : './src/**/*.stories.tsx'

  const outputArg = args.find((a) => a.startsWith('--output='))
  const output = outputArg
    ? outputArg.split('=')[1]
    : './studio.gen.ts'

  console.log('[studio] Scanning story files...')
  const files = await findStoryFiles(cwd, include)
  console.log(`[studio] Found ${files.length} story file(s)`)

  // Start LSP
  const lsp = new TsgoClient(cwd)
  let lspReady = false

  try {
    await lsp.start()
    lspReady = true
    console.log('[studio] tsgo LSP started')

    for (const file of files) {
      await lsp.openFile(file)
    }
  } catch (err) {
    console.warn('[studio] tsgo not available, generating without types')
    console.warn('[studio]', (err as Error).message)
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
  console.log(`[studio] Generated ${output}`)

  lsp.stop()
} else {
  console.log(`
  @dennation/studio

  Commands:
    generate    Generate studio.gen.ts from .stories.tsx files

  Options:
    --include=GLOB   Story files glob pattern (default: ./src/**/*.stories.tsx)
    --output=PATH    Output path for generated file (default: ./studio.gen.ts)

  Usage:
    npx @dennation/studio generate
`)
}
