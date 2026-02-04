/**
 * Test: ExpandDeep with function/ReactNode exclusions,
 * and two-step approach (Simplify + individual hover).
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
  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 200))
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
  await request('initialize', { processId: process.pid, capabilities: {}, rootUri: `file://${cwd}` })
  notify('initialized', {})
  await new Promise(r => setTimeout(r, 3000))

  const previewFile = resolve(cwd, 'test/fixtures/ComposedButton.preview.tsx')
  const originalContent = readFileSync(previewFile, 'utf-8')
  const uri = `file://${previewFile}`

  notify('textDocument/didOpen', {
    textDocument: { uri, languageId: 'typescriptreact', version: 1, text: originalContent }
  })
  await new Promise(r => setTimeout(r, 2000))

  // Strategy A: ExpandDeep with exclusions for functions and ReactNode
  const strategyA = originalContent + `
import type { ReactNode as __RN } from 'react'
type __Expand<T> = T extends (...args: any[]) => any ? T : T extends __RN ? T : T extends object ? { [K in keyof T]: __Expand<T[K]> } : T
type __PropsA = __Expand<React.ComponentProps<typeof ComposedButton>>
`
  notify('textDocument/didChange', {
    textDocument: { uri, version: 2 },
    contentChanges: [{ text: strategyA }],
  })
  await new Promise(r => setTimeout(r, 2000))

  const linesA = strategyA.split('\n')
  console.log('--- Strategy A: ExpandDeep with fn/ReactNode exclusion ---')
  console.log(await hover(uri, linesA.length - 2, 6))

  // Strategy B: Two-step — Simplify first, then hover on each unresolved type
  const strategyB = originalContent + `
type __Simplify<T> = { [K in keyof T]: T[K] } & {}
type __PropsB = __Simplify<React.ComponentProps<typeof ComposedButton>>
type __SizeResolved = React.ComponentProps<typeof ComposedButton>["size"]
type __VariantResolved = React.ComponentProps<typeof ComposedButton>["variant"]
`
  notify('textDocument/didChange', {
    textDocument: { uri, version: 3 },
    contentChanges: [{ text: strategyB }],
  })
  await new Promise(r => setTimeout(r, 2000))

  const linesB = strategyB.split('\n')
  console.log('\n--- Strategy B: Simplify + indexed access for individual props ---')
  console.log('__PropsB:', await hover(uri, linesB.length - 4, 6))
  console.log('__SizeResolved:', await hover(uri, linesB.length - 3, 6))
  console.log('__VariantResolved:', await hover(uri, linesB.length - 2, 6))

  // Restore
  notify('textDocument/didChange', {
    textDocument: { uri, version: 4 },
    contentChanges: [{ text: originalContent }],
  })

  proc.kill()
  console.log('\n[done]')
}

run().catch(err => { console.error(err); proc.kill(); process.exit(1) })
