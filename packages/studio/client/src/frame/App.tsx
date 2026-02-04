import React, { useState, useEffect, Component, type CSSProperties } from 'react'
import type { RenderMessage } from '../types'

export function App() {
  const [renderData, setRenderData] = useState<RenderMessage | null>(null)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data?.type) return

      if (data.type === 'RENDER') {
        setRenderData(data)
        setTheme(data.theme)
      } else if (data.type === 'SET_THEME') {
        setTheme(data.theme)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
  }, [theme])

  if (!renderData) return null

  return (
    <ErrorBoundary key={renderData.preview + renderData.component}>
      <PreviewRenderer data={renderData} />
    </ErrorBoundary>
  )
}

function PreviewRenderer({ data }: { data: RenderMessage }) {
  const [mod, setMod] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMod(null)
    setError(null)

    import(/* @vite-ignore */ `/@fs${data.importPath}`)
      .then(setMod)
      .catch((err) => {
        console.error('[frame] Failed to load module:', data.importPath, err)
        setError(`Failed to load preview module: ${data.importPath}\n${err.message}`)
      })
  }, [data.importPath])

  if (error) {
    return <div className="error-display">{error}</div>
  }

  if (!mod) return null

  const previewExport = mod[data.preview]
  if (!previewExport) {
    return (
      <div className="error-display">
        Export "{data.preview}" not found in {data.filePath}
      </div>
    )
  }

  if (previewExport.__type !== 'preview') {
    return <div className="error-display">Unknown export type for "{data.preview}"</div>
  }

  const PreviewComponent = previewExport.component
  const variants = data.variants ?? previewExport.variants
  const layout = data.layout ?? previewExport.layout ?? { type: 'row', gap: 16 }

  return (
    <div className="preview-container" style={getLayoutStyle(layout)}>
      {variants.map((variant: any, i: number) => (
        <div className="variant-wrapper" key={i}>
          <ErrorBoundary>
            <PreviewComponent {...variant.props} />
          </ErrorBoundary>
          <span className="variant-label">{variant.label}</span>
        </div>
      ))}
    </div>
  )
}

function getLayoutStyle(layout: {
  type: string
  gap?: number
  columns?: number
}): CSSProperties {
  const gap = (layout.gap ?? 16) + 'px'
  switch (layout.type) {
    case 'row':
      return { display: 'flex', gap, alignItems: 'flex-start', flexWrap: 'wrap' }
    case 'column':
      return {
        display: 'flex',
        flexDirection: 'column',
        gap,
        alignItems: 'flex-start',
      }
    case 'grid':
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.columns || 3}, 1fr)`,
        gap,
      }
    default:
      return { display: 'flex', gap }
  }
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <div className="error-display">{this.state.error.message}</div>
    }
    return this.props.children
  }
}
