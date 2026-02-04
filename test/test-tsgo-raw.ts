/**
 * Raw LSP test — sends messages manually to debug tsgo communication.
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const cwd = resolve(import.meta.dirname, '..')
const tsgo = resolve(cwd, 'node_modules/@typescript/native-preview-linux-x64/lib/tsgo')

const proc = spawn(tsgo, ['--lsp', '-stdio'], { cwd, stdio: ['pipe', 'pipe', 'pipe'] })

let buffer = Buffer.alloc(0)
let msgCount = 0
const SEPARATOR = Buffer.from('\r\n\r\n')

function parseMessages() {
  while (true) {
    const headerEnd = buffer.indexOf(SEPARATOR)
    if (headerEnd === -1) break
    const header = buffer.subarray(0, headerEnd).toString('utf-8')
    const m = header.match(/Content-Length:\s*(\d+)/)
    if (!m) { buffer = buffer.subarray(headerEnd + 4); continue }
    const len = parseInt(m[1], 10)
    const bodyStart = headerEnd + 4
    if (buffer.length < bodyStart + len) break
    const body = buffer.subarray(bodyStart, bodyStart + len).toString('utf-8')
    buffer = buffer.subarray(bodyStart + len)
    msgCount++
    const msg = JSON.parse(body)
    const preview = JSON.stringify(msg).slice(0, 400)
    console.log(`[recv #${msgCount}]`, msg.id !== undefined ? `id=${msg.id}` : `method=${msg.method}`, preview)

    // Respond to server requests (e.g. client/registerCapability)
    if (msg.method && msg.id !== undefined) {
      send({ jsonrpc: '2.0', id: msg.id, result: null })
    }
  }
}

proc.stdout.on('data', (chunk: Buffer) => {
  buffer = Buffer.concat([buffer, chunk])
  parseMessages()
})

proc.stderr.on('data', (d: Buffer) => {
  const msg = d.toString().trim()
  if (msg) console.error('[stderr]', msg)
})

function send(msg: any) {
  const body = JSON.stringify(msg)
  proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
  if (msg.method) console.log(`[send] id=${msg.id ?? '-'} method=${msg.method}`)
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  // 1. Initialize
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { processId: process.pid, capabilities: {}, rootUri: `file://${cwd}` } })
  await sleep(2000)

  // 2. Initialized
  send({ jsonrpc: '2.0', method: 'initialized', params: {} })
  console.log('[wait] Waiting for tsgo to load project...')
  await sleep(10000)

  // 3. Open file
  const compFile = resolve(cwd, 'test/fixtures/ComposedButton.tsx')
  const compContent = readFileSync(compFile, 'utf-8')
  send({ jsonrpc: '2.0', method: 'textDocument/didOpen', params: {
    textDocument: { uri: `file://${compFile}`, languageId: 'typescriptreact', version: 1, text: compContent }
  }})
  await sleep(2000)

  const lines = compContent.split('\n')
  console.log('\nFile:')
  lines.forEach((l, i) => console.log(`  ${i}: ${l}`))

  // Hover over "ComposedButton" in function declaration
  console.log('\n--- Hover: function name (line 7, char 20) ---')
  send({ jsonrpc: '2.0', id: 10, method: 'textDocument/hover', params: {
    textDocument: { uri: `file://${compFile}` },
    position: { line: 7, character: 20 }
  }})
  await sleep(3000)

  // Hover over "props" parameter
  console.log('\n--- Hover: props (line 7, char 32) ---')
  send({ jsonrpc: '2.0', id: 11, method: 'textDocument/hover', params: {
    textDocument: { uri: `file://${compFile}` },
    position: { line: 7, character: 32 }
  }})
  await sleep(3000)

  // Hover over "ComposedButtonProps" type
  console.log('\n--- Hover: ComposedButtonProps (line 7, char 45) ---')
  send({ jsonrpc: '2.0', id: 12, method: 'textDocument/hover', params: {
    textDocument: { uri: `file://${compFile}` },
    position: { line: 7, character: 45 }
  }})
  await sleep(3000)

  proc.kill()
  console.log('\n[done]')
}

run()
