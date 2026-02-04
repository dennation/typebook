import { loadConfig } from '../config.js'
import { startDevServer } from '../server/dev-server.js'

const args = process.argv.slice(2)
const command = args[0]

if (command === 'preview') {
  const cwd = process.cwd()
  const portArg = args.find((a) => a.startsWith('--port='))
  const port = portArg ? parseInt(portArg.split('=')[1], 10) : undefined

  console.log('[studio] Loading config...')
  const config = await loadConfig(cwd)

  await startDevServer({ cwd, config, port })
} else {
  console.log(`
  @dennation/studio

  Commands:
    preview    Start the component preview dev server

  Options:
    --port=N   Dev server port (default: 3000)

  Usage:
    npx @dennation/studio preview
    npx @dennation/studio preview --port=4000
`)
}
