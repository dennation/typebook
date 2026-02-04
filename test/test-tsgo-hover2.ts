/**
 * Test hover on InlineButtonProps (type alias + intersection)
 * and also test hover on individual members of ComposedButtonProps.
 */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const cwd = resolve(import.meta.dirname, '..')
const tsgo = resolve(cwd, 'node_modules/@typescript/native-preview-linux-x64/lib/tsgo')

const proc = spawn(tsgo, ['--lsp', '-stdio'], { cwd, stdio: ['pipe', 'pipe', 'pipe'] })

let buffer = Buffer.alloc(0)
const SEPARATOR = Buffer.from('\r\n\r\n')
const responses = new Map<number, any>()

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
    const msg = JSON.parse(body)

    if (msg.method && msg.id !== undefined) {
      send({ jsonrpc: '2.0', id: msg.id, result: null })
    }
    if (msg.id !== undefined && !msg.method) {
      responses.set(msg.id as number, msg)
    }
  }
}

proc.stdout.on('data', (chunk: Buffer) => {
  buffer = Buffer.concat([buffer, chunk])
  parseMessages()
})
proc.stderr.on('data', () => {})

let reqId = 0
function send(msg: any) {
  const body = JSON.stringify(msg)
  proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
}

async function request(method: string, params: any): Promise<any> {
  const id = ++reqId
  send({ jsonrpc: '2.0', id, method, params })
  // Poll for response
  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 200))
    if (responses.has(id)) {
      const resp = responses.get(id)!
      responses.delete(id)
      return resp.result
    }
  }
  throw new Error(`Timeout waiting for response to ${method} (id=${id})`)
}

function notify(method: string, params: any) {
  send({ jsonrpc: '2.0', method, params })
}

async function openFile(filePath: string) {
  const absPath = resolve(cwd, filePath)
  const content = readFileSync(absPath, 'utf-8')
  notify('textDocument/didOpen', {
    textDocument: { uri: `file://${absPath}`, languageId: 'typescriptreact', version: 1, text: content }
  })
  await new Promise(r => setTimeout(r, 1000))
}

async function hover(filePath: string, line: number, char: number): Promise<string | null> {
  const absPath = resolve(cwd, filePath)
  const result = await request('textDocument/hover', {
    textDocument: { uri: `file://${absPath}` },
    position: { line, character: char }
  })
  return result?.contents?.value ?? null
}

async function run() {
  // Initialize
  await request('initialize', {
    processId: process.pid,
    capabilities: {},
    rootUri: `file://${cwd}`
  })
  notify('initialized', {})
  await new Promise(r => setTimeout(r, 3000))

  // --- Test 1: InlineButton with type alias intersection ---
  const inlineFile = 'test/fixtures/InlineButton.tsx'
  await openFile(inlineFile)

  console.log('=== InlineButton.tsx ===')
  console.log(readFileSync(resolve(cwd, inlineFile), 'utf-8'))

  // line 7: export function InlineButton(props: InlineButtonProps) {
  console.log('Hover on InlineButton name:')
  console.log(await hover(inlineFile, 7, 20))

  console.log('\nHover on props:')
  console.log(await hover(inlineFile, 7, 32))

  console.log('\nHover on InlineButtonProps:')
  console.log(await hover(inlineFile, 7, 45))

  // Also hover on the type alias definition (line 2)
  // line 2: type InlineButtonProps = BaseProps & InteractiveProps & {
  console.log('\nHover on type alias def (line 2, char 6):')
  console.log(await hover(inlineFile, 2, 6))

  // --- Test 2: Hover on individual fields in ComposedButton.tsx ---
  const compFile = 'test/fixtures/ComposedButton.tsx'
  await openFile(compFile)

  console.log('\n=== ComposedButton.tsx ===')
  console.log(readFileSync(resolve(cwd, compFile), 'utf-8'))

  // line 3: size: Size
  console.log('Hover on size field (line 3, char 3):')
  console.log(await hover(compFile, 3, 3))

  // line 3: Size type reference
  console.log('\nHover on Size type (line 3, char 9):')
  console.log(await hover(compFile, 3, 9))

  // line 4: variant: Variant
  console.log('\nHover on Variant type (line 4, char 12):')
  console.log(await hover(compFile, 4, 12))

  proc.kill()
  console.log('\n[done]')
}

run().catch(err => { console.error(err); proc.kill(); process.exit(1) })
