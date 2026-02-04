import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ComponentEntry } from '../types.js'

type SSEClient = {
  res: ServerResponse
  component: string | null
}

/**
 * SSE manager for pushing type updates to connected browsers.
 */
export class SSEManager {
  private clients: SSEClient[] = []

  handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const component = url.searchParams.get('component')

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    res.write('data: {"type":"connected"}\n\n')

    const client: SSEClient = { res, component }
    this.clients.push(client)

    req.on('close', () => {
      this.clients = this.clients.filter((c) => c !== client)
    })
  }

  /**
   * Push updated component data to all interested clients.
   */
  pushUpdate(entry: ComponentEntry): void {
    const data = JSON.stringify({
      type: 'types_updated',
      component: entry.name,
      props: entry.props,
      previews: entry.previews,
    })

    for (const client of this.clients) {
      if (client.component === null || client.component === entry.name) {
        client.res.write(`data: ${data}\n\n`)
      }
    }
  }

  /**
   * Push full registry update to all clients.
   */
  pushFullUpdate(entries: ComponentEntry[]): void {
    const data = JSON.stringify({
      type: 'registry_updated',
      components: entries,
    })

    for (const client of this.clients) {
      client.res.write(`data: ${data}\n\n`)
    }
  }

  disconnectAll(): void {
    for (const client of this.clients) {
      client.res.end()
    }
    this.clients = []
  }
}
