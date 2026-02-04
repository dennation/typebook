import { TsgoClient } from '../src/lsp/client.js'
import { resolve } from 'node:path'

const cwd = resolve(import.meta.dirname, '..')

async function run() {
  console.log('[test] Starting tsgo LSP client...')
  const client = new TsgoClient(cwd)
  await client.start()
  console.log('[test] tsgo started\n')

  // Open the preview file (this triggers tsgo to load the project)
  const previewFile = 'test/fixtures/ComposedButton.preview.tsx'
  console.log('[test] Opening', previewFile)
  await client.openFile(previewFile)

  // Also open the component file so tsgo can resolve imports
  const componentFile = 'test/fixtures/ComposedButton.tsx'
  console.log('[test] Opening', componentFile)
  await client.openFile(componentFile)

  // Test 1: hover over ComposedButton in the preview file
  console.log('\n--- Hover over ComposedButton in preview file ---')
  const hover = await client.hover(previewFile, 3, 38) // line 4 (0-indexed: 3), "ComposedButton" in setup()
  console.log('Hover result:', hover)

  // Test 2: extract props via getComponentProps
  console.log('\n--- Extract props for ComposedButton ---')
  const props = await client.getComponentProps(previewFile, 'ComposedButton')
  console.log('Props:', JSON.stringify(props, null, 2))

  client.stop()
  console.log('\n[test] Done')
}

run().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
