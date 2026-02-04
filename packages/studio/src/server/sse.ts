import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ComponentEntry } from '../types.js'

/**
 * SSE manager for pushing type updates to connected browsers.
 */
export class SSEManager {
  private clients: ServerResponse[] = []

  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    res.write('data: {"type":"connected"}\n\n')

    this.clients.push(res)

    req.on('close', () => {
      this.clients = this.clients.filter((c) => c !== res)
    })
  }

  pushFullUpdate(entries: ComponentEntry[]): void {
    const data = JSON.stringify({
      type: 'registry_updated',
      components: entries,
    })

    for (const client of this.clients) {
      client.write(`data: ${data}\n\n`)
    }
  }

  disconnectAll(): void {
    for (const client of this.clients) {
      client.end()
    }
    this.clients = []
  }
}
