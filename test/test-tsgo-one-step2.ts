/**
 * More attempts at single-step full expansion.
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

let version = 1

async function testStrategy(uri: string, base: string, label: string, injection: string) {
  const content = base + '\n' + injection + '\n'
  version++
  notify('textDocument/didChange', {
    textDocument: { uri, version },
    contentChanges: [{ text: content }],
  })
  const lines = content.split('\n')
  // hover on last non-empty type alias
  const targetLine = lines.length - 2
  const t0 = performance.now()
  const result = await hover(uri, targetLine, 6)
  console.log(`[${label}] (${(performance.now() - t0).toFixed(0)}ms)`)
  console.log(`  ${result}\n`)
}

async function run() {
  await request('initialize', { processId: process.pid, capabilities: {}, rootUri: `file://${cwd}` })
  notify('initialized', {})
  await new Promise(r => setTimeout(r, 2000))

  const previewFile = resolve(cwd, 'test/fixtures/ComposedButton.preview.tsx')
  const base = readFileSync(previewFile, 'utf-8')
  const uri = `file://${previewFile}`

  notify('textDocument/didOpen', {
    textDocument: { uri, languageId: 'typescriptreact', version: 1, text: base }
  })
  await new Promise(r => setTimeout(r, 1500))

  type P = `React.ComponentProps<typeof ComposedButton>`
  const P = 'React.ComponentProps<typeof ComposedButton>'

  // A: extends infer U to break alias
  await testStrategy(uri, base, 'extends infer U',
    `type __A<T> = { [K in keyof T]: T[K] extends infer U ? U : never } & {}\ntype __Props = __A<${P}>`
  )

  // B: double infer
  await testStrategy(uri, base, 'double infer',
    `type __B<T> = T extends infer O ? { [K in keyof O]: O[K] extends infer V ? V : never } & {} : never\ntype __Props = __B<${P}>`
  )

  // C: template literal inline in mapped type
  await testStrategy(uri, base, 'template literal inline',
    `type __C<T> = { [K in keyof T]: T[K] extends string ? \`\${T[K]}\` extends infer S ? S : T[K] : T[K] } & {}\ntype __Props = __C<${P}>`
  )

  // D: template literal append+strip
  await testStrategy(uri, base, 'template append+strip',
    `type __D<T> = { [K in keyof T]: T[K] extends string ? \`\${T[K]}_\` extends \`\${infer U}_\` ? U : T[K] : T[K] } & {}\ntype __Props = __D<${P}>`
  )

  // E: conditional + mapped + intersection trick
  await testStrategy(uri, base, 'conditional remap',
    `type __E<T> = { [K in keyof T]: T[K] extends string ? T[K] & string : T[K] } & {}\ntype __Props = __E<${P}>`
  )

  // Restore
  version++
  notify('textDocument/didChange', {
    textDocument: { uri, version },
    contentChanges: [{ text: base }],
  })

  proc.kill()
}

run().catch(err => { console.error(err); proc.kill(); process.exit(1) })
