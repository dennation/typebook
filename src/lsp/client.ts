import { spawn, type ChildProcess } from 'node:child_process'
import { resolve } from 'node:path'
import type { PropInfo } from '../types.js'
import { tryParseTypeString } from '../parser/type-parser.js'

/**
 * Minimal LSP client for tsgo.
 *
 * Implements just enough of the Language Server Protocol
 * to extract prop types via hover requests.
 */
export class TsgoClient {
  private process: ChildProcess | null = null
  private buffer = ''
  private requestId = 0
  private pending = new Map<
    number,
    { resolve: (value: any) => void; reject: (err: Error) => void }
  >()
  private initialized = false

  constructor(private cwd: string) {}

  async start(): Promise<void> {
    const tsgoPath = this.findTsgo()

    this.process = spawn(tsgoPath, ['--stdio'], {
      cwd: this.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.process.stdout!.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString()
      this.processBuffer()
    })

    this.process.stderr!.on('data', (chunk: Buffer) => {
      console.error('[tsgo]', chunk.toString())
    })

    this.process.on('exit', (code) => {
      console.log('[tsgo] exited with code', code)
      this.process = null
    })

    await this.initialize()
  }

  stop(): void {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    this.initialized = false
  }

  private findTsgo(): string {
    // Look for tsgo in common locations
    const candidates = [
      resolve(this.cwd, 'node_modules', '.bin', 'tsgo'),
      'tsgo',
    ]

    // Return first candidate — spawn will handle if not found
    return candidates[0]
  }

  private async initialize(): Promise<void> {
    const result = await this.request('initialize', {
      processId: process.pid,
      capabilities: {},
      rootUri: `file://${this.cwd}`,
      workspaceFolders: [
        { uri: `file://${this.cwd}`, name: 'workspace' },
      ],
    })

    await this.notify('initialized', {})
    this.initialized = true
    return result
  }

  async openFile(filePath: string): Promise<void> {
    const { readFileSync } = await import('node:fs')
    const content = readFileSync(filePath, 'utf-8')
    const uri = `file://${resolve(this.cwd, filePath)}`

    await this.notify('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId: filePath.endsWith('.tsx') ? 'typescriptreact' : 'typescript',
        version: 1,
        text: content,
      },
    })
  }

  /**
   * Hover over a position to get type information.
   * Returns the hover content as a string.
   */
  async hover(filePath: string, line: number, character: number): Promise<string | null> {
    const uri = `file://${resolve(this.cwd, filePath)}`

    const result = await this.request('textDocument/hover', {
      textDocument: { uri },
      position: { line, character },
    })

    if (!result?.contents) return null

    // Extract the type string from hover result
    const contents = result.contents
    if (typeof contents === 'string') return contents
    if (contents.value) return contents.value
    if (Array.isArray(contents)) {
      return contents.map((c: any) => (typeof c === 'string' ? c : c.value)).join('\n')
    }

    return null
  }

  /**
   * Extract prop types for a component by hovering over its reference.
   */
  async getComponentProps(
    filePath: string,
    componentName: string,
  ): Promise<PropInfo[] | null> {
    const { readFileSync } = await import('node:fs')
    const absPath = resolve(this.cwd, filePath)
    const content = readFileSync(absPath, 'utf-8')
    const lines = content.split('\n')

    // Find the setup() call and hover over the component argument
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      const setupMatch = line.match(new RegExp(`setup\\(\\s*(${componentName})`))
      if (!setupMatch) continue

      const charPos = setupMatch.index! + setupMatch[0].indexOf(componentName)
      const hoverResult = await this.hover(filePath, lineNum, charPos)
      if (!hoverResult) continue

      // Extract props type from hover result
      // Typically looks like: "(alias) function Button(props: ButtonProps): JSX.Element"
      // or the type itself
      const propsTypeMatch = hoverResult.match(
        /props:\s*({[^}]+})|type\s+\w+Props\s*=\s*({[^}]+})/,
      )
      if (propsTypeMatch) {
        const typeStr = propsTypeMatch[1] ?? propsTypeMatch[2]
        return await tryParseTypeString(typeStr)
      }

      // Try broader extraction — look for object type patterns
      const objectMatch = hoverResult.match(/\{[^}]+\}/)
      if (objectMatch) {
        return await tryParseTypeString(objectMatch[0])
      }
    }

    return null
  }

  private request(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId
      this.pending.set(id, { resolve, reject })
      this.send({ jsonrpc: '2.0', id, method, params })
    })
  }

  private notify(method: string, params: any): Promise<void> {
    this.send({ jsonrpc: '2.0', method, params })
    return Promise.resolve()
  }

  private send(message: any): void {
    if (!this.process?.stdin) {
      throw new Error('tsgo process not running')
    }

    const body = JSON.stringify(message)
    const header = `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n`
    this.process.stdin.write(header + body)
  }

  private processBuffer(): void {
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n')
      if (headerEnd === -1) break

      const header = this.buffer.slice(0, headerEnd)
      const match = header.match(/Content-Length:\s*(\d+)/)
      if (!match) {
        this.buffer = this.buffer.slice(headerEnd + 4)
        continue
      }

      const contentLength = parseInt(match[1], 10)
      const bodyStart = headerEnd + 4
      if (this.buffer.length < bodyStart + contentLength) break

      const body = this.buffer.slice(bodyStart, bodyStart + contentLength)
      this.buffer = this.buffer.slice(bodyStart + contentLength)

      try {
        const message = JSON.parse(body)
        this.handleMessage(message)
      } catch {
        // Ignore malformed messages
      }
    }
  }

  private handleMessage(message: any): void {
    if (message.id !== undefined && this.pending.has(message.id)) {
      const handler = this.pending.get(message.id)!
      this.pending.delete(message.id)

      if (message.error) {
        handler.reject(new Error(message.error.message))
      } else {
        handler.resolve(message.result)
      }
    }
  }
}
