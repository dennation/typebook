/**
 * Test: hover on setup() result in preview file
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

proc.stdout.on('data', (chunk: Buffer) => { buffer = Buffer.concat([buffer, chunk]); parseMessages() })
proc.stderr.on('data', () => {})

let reqId = 0
function send(msg: any) {
  const body = JSON.stringify(msg)
  proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
}

async function request(method: string, params: any): Promise<any> {
  const id = ++reqId
  send({ jsonrpc: '2.0', id, method, params })
  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 200))
    if (responses.has(id)) { const r = responses.get(id)!; responses.delete(id); return r.result }
  }
  throw new Error(`Timeout: ${method} id=${id}`)
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
  await request('initialize', { processId: process.pid, capabilities: {}, rootUri: `file://${cwd}` })
  notify('initialized', {})
  await new Promise(r => setTimeout(r, 3000))

  const previewFile = 'test/fixtures/ComposedButton.preview.tsx'
  await openFile(previewFile)
  await new Promise(r => setTimeout(r, 2000))

  const content = readFileSync(resolve(cwd, previewFile), 'utf-8')
  console.log('File:')
  content.split('\n').forEach((l, i) => console.log(`  ${i}: ${l}`))

  // Hover on "composedButton" — result of setup()
  // line 3: export const composedButton = setup(ComposedButton, {
  console.log('\n--- Hover on "composedButton" (line 3, char 13) ---')
  console.log(await hover(previewFile, 3, 13))

  // Hover on "setup" call
  console.log('\n--- Hover on "setup" (line 3, char 35) ---')
  console.log(await hover(previewFile, 3, 35))

  // Hover on "ComposedButton" arg
  console.log('\n--- Hover on "ComposedButton" (line 3, char 41) ---')
  console.log(await hover(previewFile, 3, 41))

  // Hover on "showVariants" call
  // line 10: export const Sizes = composedButton.showVariants('size')
  console.log('\n--- Hover on "showVariants" (line 10, char 40) ---')
  console.log(await hover(previewFile, 10, 40))

  // Hover on 'size' string literal arg
  console.log('\n--- Hover on "size" string arg (line 10, char 55) ---')
  console.log(await hover(previewFile, 10, 55))

  proc.kill()
  console.log('\n[done]')
}

run().catch(err => { console.error(err); proc.kill(); process.exit(1) })
