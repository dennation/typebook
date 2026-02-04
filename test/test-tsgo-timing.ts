/**
 * Benchmark: two-step type extraction timing.
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
    if (msg.method && msg.id !== undefined) send({ jsonrpc: '2.0', id: msg.id, result: null })
    if (msg.id !== undefined && !msg.method) responses.set(msg.id as number, msg)
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
  for (let i = 0; i < 150; i++) {
    await new Promise(r => setTimeout(r, 100))
    if (responses.has(id)) { const r = responses.get(id)!; responses.delete(id); return r.result }
  }
  throw new Error(`Timeout: ${method} id=${id}`)
}

function notify(method: string, params: any) { send({ jsonrpc: '2.0', method, params }) }

async function hover(uri: string, line: number, char: number): Promise<string | null> {
  const result = await request('textDocument/hover', {
    textDocument: { uri },
    position: { line, character: char }
  })
  return result?.contents?.value ?? null
}

async function run() {
  const t0 = performance.now()
  await request('initialize', { processId: process.pid, capabilities: {}, rootUri: `file://${cwd}` })
  notify('initialized', {})
  await new Promise(r => setTimeout(r, 2000))
  console.log(`init: ${(performance.now() - t0).toFixed(0)}ms`)

  const previewFile = resolve(cwd, 'test/fixtures/ComposedButton.preview.tsx')
  const originalContent = readFileSync(previewFile, 'utf-8')
  const uri = `file://${previewFile}`

  const t1 = performance.now()
  notify('textDocument/didOpen', {
    textDocument: { uri, languageId: 'typescriptreact', version: 1, text: originalContent }
  })
  await new Promise(r => setTimeout(r, 1500))
  console.log(`didOpen: ${(performance.now() - t1).toFixed(0)}ms`)

  // Step 1: inject Simplify + hover
  const step1Content = originalContent + `
type __Simplify<T> = { [K in keyof T]: T[K] } & {}
type __Props = __Simplify<React.ComponentProps<typeof ComposedButton>>
`
  const t2 = performance.now()
  notify('textDocument/didChange', {
    textDocument: { uri, version: 2 },
    contentChanges: [{ text: step1Content }],
  })
  const lines1 = step1Content.split('\n')
  const propsHover = await hover(uri, lines1.length - 2, 6)
  const t2end = performance.now()
  console.log(`\nStep 1 (didChange + Simplify hover): ${(t2end - t2).toFixed(0)}ms`)
  console.log('  →', propsHover)

  // Step 2: inject indexed access types for each unresolved field
  const unresolvedFields = ['size', 'variant']

  const step2Lines = unresolvedFields.map(f =>
    `type __Resolve_${f} = React.ComponentProps<typeof ComposedButton>["${f}"]`
  )
  const step2Content = originalContent + '\n' + step2Lines.join('\n') + '\n'

  const t3 = performance.now()
  notify('textDocument/didChange', {
    textDocument: { uri, version: 3 },
    contentChanges: [{ text: step2Content }],
  })

  const lines2 = step2Content.split('\n')
  const baseLine = lines2.length - unresolvedFields.length - 1
  for (let i = 0; i < unresolvedFields.length; i++) {
    const result = await hover(uri, baseLine + i, 6)
    console.log(`  ${unresolvedFields[i]}: ${result}`)
  }
  const t3end = performance.now()
  console.log(`Step 2 (didChange + ${unresolvedFields.length} indexed hovers): ${(t3end - t3).toFixed(0)}ms`)
  console.log(`\nTotal extraction (step 1 + 2): ${(t3end - t2).toFixed(0)}ms`)

  // Restore
  notify('textDocument/didChange', {
    textDocument: { uri, version: 4 },
    contentChanges: [{ text: originalContent }],
  })

  proc.kill()
}

run().catch(err => { console.error(err); proc.kill(); process.exit(1) })
