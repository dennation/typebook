import { spawn, type ChildProcess } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { PropInfo } from '../types.js'
import { tryParseTypeString } from './type-parser.js'

// --- JSON-RPC types ---

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params: Record<string, unknown>
}

interface JsonRpcNotification {
  jsonrpc: '2.0'
  method: string
  params: Record<string, unknown>
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number
  result?: unknown
  error?: { code: number; message: string }
}

interface JsonRpcServerRequest {
  jsonrpc: '2.0'
  id: number
  method: string
}

type JsonRpcMessage = JsonRpcResponse | JsonRpcServerRequest

interface HoverContentsMarkup {
  value: string
}

type HoverContents = string | HoverContentsMarkup | (string | HoverContentsMarkup)[]

interface HoverResult {
  contents: HoverContents
}

/**
 * LSP client for tsgo (@typescript/native-preview).
 *
 * Spawns `tsgo --lsp -stdio` and communicates via JSON-RPC
 * over stdin/stdout to extract prop types via hover.
 */
export class TsgoClient {
  private process: ChildProcess | null = null
  private buffer = Buffer.alloc(0)
  private requestId = 0
  private fileVersions = new Map<string, number>()
  private pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (err: Error) => void }
  >()

  constructor(private cwd: string) {}

  async start(): Promise<void> {
    const tsgoPath = await this.findTsgo()

    this.process = spawn(tsgoPath, ['--lsp', '-stdio'], {
      cwd: this.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.process.stdout!.on('data', (chunk: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, chunk])
      this.processBuffer()
    })

    this.process.stderr!.on('data', (chunk: Buffer) => {
      const msg = chunk.toString().trim()
      if (msg) console.error('[tsgo]', msg)
    })

    this.process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error('[tsgo] exited with code', code)
      }
      this.process = null
    })

    await this.initialize()
  }

  stop(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }

  private async findTsgo(): Promise<string> {
    const pkgUrl = import.meta.resolve('@typescript/native-preview/package.json')
    const pkgDir = dirname(fileURLToPath(pkgUrl))
    const { default: getExePath } = await import(pathToFileURL(resolve(pkgDir, 'lib', 'getExePath.js')).href)
    return getExePath()
  }

  private async initialize(): Promise<void> {
    await this.request('initialize', {
      processId: process.pid,
      capabilities: {},
      rootUri: `file://${this.cwd}`,
      workspaceFolders: [
        { uri: `file://${this.cwd}`, name: 'workspace' },
      ],
    })

    this.notify('initialized', {})
  }

  async openFile(filePath: string): Promise<void> {
    const absPath = resolve(this.cwd, filePath)
    const content = readFileSync(absPath, 'utf-8')
    const uri = `file://${absPath}`

    this.fileVersions.set(absPath, 1)
    this.notify('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId: filePath.endsWith('.tsx') ? 'typescriptreact' : 'typescript',
        version: 1,
        text: content,
      },
    })

    // Give tsgo time to process the file
    await this.sleep(200)
  }

  async notifyChange(filePath: string): Promise<void> {
    const absPath = resolve(this.cwd, filePath)
    const content = readFileSync(absPath, 'utf-8')
    const uri = `file://${absPath}`
    const version = (this.fileVersions.get(absPath) ?? 1) + 1
    this.fileVersions.set(absPath, version)

    this.notify('textDocument/didChange', {
      textDocument: { uri, version },
      contentChanges: [{ text: content }],
    })

    await this.sleep(100)
  }

  async hover(filePath: string, line: number, character: number): Promise<string | null> {
    const absPath = resolve(this.cwd, filePath)
    const uri = `file://${absPath}`

    const result = await this.request('textDocument/hover', {
      textDocument: { uri },
      position: { line, character },
    }) as HoverResult | null

    if (!result?.contents) return null

    const contents = result.contents
    if (typeof contents === 'string') return contents
    if (Array.isArray(contents)) {
      return contents.map((c) => (typeof c === 'string' ? c : c.value)).join('\n')
    }
    return contents.value
  }

  /**
   * Extract prop types for a component by hovering over its usage.
   *
   * Strategy: find the component reference in the source file,
   * hover over it, parse the resulting type signature to extract
   * the resolved props type (handles composed/imported types).
   */
  async getComponentProps(
    filePath: string,
  ): Promise<PropInfo[] | null> {
    const absPath = resolve(this.cwd, filePath)
    const content = readFileSync(absPath, 'utf-8')
    const lines = content.split('\n')

    // Find "export default X" and hover on X to get SetupResult<Props> type
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      const match = line.match(/export\s+default\s+(\w+)/)
      if (!match || match.index === undefined) continue

      const identifier = match[1]
      const charPos = match.index + match[0].indexOf(identifier)

      const hoverResult = await this.hover(filePath, lineNum, charPos)
      if (!hoverResult) continue

      return this.extractPropsFromHover(hoverResult)
    }

    return null
  }

  /**
   * Parse the hover result to extract a props type string,
   * then feed it to the type-parser.
   *
   * Hover result formats from tsgo:
   *   "function Button(props: { size: 'sm' | 'md' | 'lg'; ... }): JSX.Element"
   *   "(alias) function Button(props: ButtonProps): Element"
   *
   * For inline props we can extract directly.
   * For named types we need a second hover on the type name.
   */
  private async extractPropsFromHover(hover: string): Promise<PropInfo[] | null> {
    // Case 1: inline object type in params — props: { ... }
    // Use a brace-matching approach to handle nested braces
    const inlineMatch = hover.match(/props:\s*\{/)
    if (inlineMatch && inlineMatch.index !== undefined) {
      const startIdx = hover.indexOf('{', inlineMatch.index)
      const extracted = extractBalancedBraces(hover, startIdx)
      if (extracted) {
        return await tryParseTypeString(extracted)
      }
    }

    // Case 2: named type reference — props: SomeType
    const namedMatch = hover.match(/props:\s*([A-Z]\w+)/)
    if (namedMatch) {
      // The named type was resolved by tsgo, but shown as a name.
      // We can't hover further without knowing the location.
      // For now, return null — the caller can try alternative extraction.
      return null
    }

    // Case 3: try to find any object type in the hover
    const braceIdx = hover.indexOf('{')
    if (braceIdx !== -1) {
      const extracted = extractBalancedBraces(hover, braceIdx)
      if (extracted) {
        return await tryParseTypeString(extracted)
      }
    }

    return null
  }

  // --- JSON-RPC transport ---

  private request(method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('tsgo process not running'))
        return
      }
      const id = ++this.requestId
      this.pending.set(id, { resolve, reject })
      this.send({ jsonrpc: '2.0', id, method, params })
    })
  }

  private notify(method: string, params: Record<string, unknown>): void {
    this.send({ jsonrpc: '2.0', method, params })
  }

  private send(message: JsonRpcRequest | JsonRpcNotification | JsonRpcResponse): void {
    if (!this.process?.stdin) {
      throw new Error('tsgo process not running')
    }

    const body = JSON.stringify(message)
    const header = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`
    this.process.stdin.write(header + body)
  }

  private processBuffer(): void {
    const SEPARATOR = Buffer.from('\r\n\r\n')

    while (true) {
      const headerEnd = this.buffer.indexOf(SEPARATOR)
      if (headerEnd === -1) break

      const header = this.buffer.subarray(0, headerEnd).toString('utf-8')
      const match = header.match(/Content-Length:\s*(\d+)/)
      if (!match) {
        this.buffer = this.buffer.subarray(headerEnd + 4)
        continue
      }

      const contentLength = parseInt(match[1], 10)
      const bodyStart = headerEnd + 4
      if (this.buffer.length < bodyStart + contentLength) break

      const body = this.buffer.subarray(bodyStart, bodyStart + contentLength).toString('utf-8')
      this.buffer = this.buffer.subarray(bodyStart + contentLength)

      try {
        const message: JsonRpcMessage = JSON.parse(body)
        this.handleMessage(message)
      } catch {
        // Ignore malformed messages
      }
    }
  }

  private handleMessage(message: JsonRpcMessage): void {
    // Response to our request
    if ('result' in message || 'error' in message) {
      const handler = this.pending.get(message.id)
      if (!handler) return
      this.pending.delete(message.id)

      if ('error' in message && message.error) {
        handler.reject(new Error(message.error.message))
      } else {
        handler.resolve((message as JsonRpcResponse).result)
      }
      return
    }

    // Server-initiated request — respond with null to acknowledge
    if ('method' in message && message.id !== undefined) {
      this.send({ jsonrpc: '2.0', id: message.id, result: null })
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms))
  }
}

/**
 * Extract a balanced brace-delimited substring starting at `start`.
 * Returns the full `{ ... }` string, or null if unbalanced.
 */
function extractBalancedBraces(str: string, start: number): string | null {
  if (str[start] !== '{') return null
  let depth = 0
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++
    else if (str[i] === '}') depth--
    if (depth === 0) return str.slice(start, i + 1)
  }
  return null
}
