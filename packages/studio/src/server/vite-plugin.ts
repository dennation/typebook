import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ComponentEntry } from '../types.js'
import type { SSEManager } from './sse.js'

export interface StudioPluginOptions {
  getRegistry: () => ComponentEntry[]
  sse: SSEManager
  breakpoints: Record<string, number>
  port: number
  stylesPath: string | null
  clientDir: string
}

export function studioPlugin(options: StudioPluginOptions): Plugin {
  const { getRegistry, sse, breakpoints, port, stylesPath, clientDir } = options

  return {
    name: 'studio',

    configureServer(server) {
      // Return a function so middleware runs after Vite's internal middleware
      // but we actually want ours to run first (before Vite serves index.html)
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
        const pathname = url.pathname

        // SSE endpoint
        if (pathname === '/events') {
          sse.handleRequest(req, res)
          return
        }

        // API: components list
        if (pathname === '/api/components') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify(getRegistry()))
          return
        }

        // API: single component
        if (pathname.startsWith('/api/component/')) {
          const name = pathname.slice('/api/component/'.length)
          const entry = getRegistry().find((c) => c.name.toLowerCase() === name.toLowerCase())
          if (entry) {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            })
            res.end(JSON.stringify(entry))
          } else {
            res.writeHead(404)
            res.end('Not found')
          }
          return
        }

        // API: config
        if (pathname === '/api/config') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify({ breakpoints, port, stylesPath }))
          return
        }

        // SPA fallback: serve index.html for host routes
        if (
          pathname === '/' ||
          pathname.match(/^\/[A-Za-z0-9-]+\/[A-Za-z0-9]+$/)
        ) {
          const indexPath = resolve(clientDir, 'index.html')
          let html = readFileSync(indexPath, 'utf-8')
          server
            .transformIndexHtml(pathname, html)
            .then((transformed) => {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(transformed)
            })
            .catch(next)
          return
        }

        next()
      })
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Inject user styles into frame.html
        if (ctx.path === '/frame.html' && stylesPath) {
          return html.replace(
            '</head>',
            `  <link rel="stylesheet" href="/@fs${stylesPath}" />\n</head>`,
          )
        }
        return html
      },
    },
  }
}
