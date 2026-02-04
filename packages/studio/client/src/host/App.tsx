import { useState, useEffect, useRef, useCallback } from 'react'
import type { ComponentEntry, Config } from '../types'

export function App() {
  const [components, setComponents] = useState<ComponentEntry[]>([])
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  const [activePreview, setActivePreview] = useState<string | null>(null)
  const [breakpoint, setBreakpoint] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [config, setConfig] = useState<Config | null>(null)
  const [scaleInfo, setScaleInfo] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch config and components on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)

    fetch('/api/components')
      .then((r) => r.json())
      .then(setComponents)

    const es = new EventSource('/events')
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'registry_updated') {
        setComponents(data.components)
      }
    }
    return () => es.close()
  }, [])

  // Parse URL on mount
  useEffect(() => {
    const parseUrl = () => {
      const match = location.pathname.match(/^\/([A-Za-z0-9-]+)\/([A-Za-z0-9]+)$/)
      if (match) {
        setActiveComponent(match[1])
        setActivePreview(match[2])
      }
    }
    parseUrl()
    window.addEventListener('popstate', parseUrl)
    return () => window.removeEventListener('popstate', parseUrl)
  }, [])

  // Theme on document
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Update iframe size when breakpoint changes
  const updateIframeSize = useCallback(() => {
    const wrapper = wrapperRef.current
    const main = mainRef.current
    if (!wrapper || !main || !config) return

    if (!breakpoint) {
      wrapper.style.width = '100%'
      wrapper.style.transform = ''
      wrapper.style.transformOrigin = ''
      setScaleInfo('')
      return
    }

    const bpWidth = config.breakpoints[breakpoint]
    const available = main.clientWidth - 48
    const scale = Math.min(1, available / bpWidth)
    const label =
      breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1) + ' ' + bpWidth + 'px'

    wrapper.style.width = bpWidth + 'px'

    if (scale < 1) {
      wrapper.style.transform = `scale(${scale})`
      wrapper.style.transformOrigin = 'top left'
      setScaleInfo(`${label}  ${Math.round(scale * 100)}%`)
    } else {
      wrapper.style.transform = ''
      setScaleInfo(label)
    }
  }, [breakpoint, config])

  useEffect(() => {
    updateIframeSize()
  }, [updateIframeSize])

  // Resize observer on main
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const observer = new ResizeObserver(() => updateIframeSize())
    observer.observe(main)
    return () => observer.disconnect()
  }, [updateIframeSize])

  const selectPreview = (component: string, preview: string) => {
    setActiveComponent(component)
    setActivePreview(preview)
    history.pushState(null, '', `/${component}/${preview}`)
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'SET_THEME', theme: next },
      '*',
    )
  }

  // Find active component and preview data
  const comp = components.find((c) => c.name === activeComponent)
  const preview = comp?.previews.find((p) => p.name === activePreview)

  const sendRender = () => {
    if (!iframeRef.current?.contentWindow || !comp || !preview) return
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'RENDER',
        component: comp.name,
        preview: preview.name,
        filePath: comp.filePath,
        importPath: comp.importPath,
        variants: preview.variants,
        layout: preview.layout,
        theme,
      },
      '*',
    )
  }

  // Re-send render message when active preview changes
  useEffect(() => {
    sendRender()
  }, [activeComponent, activePreview, components])

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <span className="header-title">Studio</span>
        <div className="header-controls">
          {config && (
            <div className="breakpoint-group">
              <button
                className={`breakpoint-btn${breakpoint === null ? ' active' : ''}`}
                onClick={() => setBreakpoint(null)}
              >
                Auto
              </button>
              {Object.keys(config.breakpoints).map((name) => (
                <button
                  key={name}
                  className={`breakpoint-btn${breakpoint === name ? ' active' : ''}`}
                  onClick={() => setBreakpoint(name)}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>
          )}
          <span className="scale-indicator">{scaleInfo}</span>
          <button className="theme-toggle" title="Toggle theme" onClick={toggleTheme}>
            <span>{theme === 'light' ? '\u263C' : '\u263E'}</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        {components.map((c) => (
          <div key={c.name} className="sidebar-section">
            <div className="sidebar-component">{c.name}</div>
            {c.previews.map((p) => (
              <a
                key={p.name}
                className={`sidebar-item${
                  activeComponent === c.name && activePreview === p.name ? ' active' : ''
                }`}
                href={`/${c.name}/${p.name}`}
                onClick={(e) => {
                  e.preventDefault()
                  selectPreview(c.name, p.name)
                }}
              >
                {p.name}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {/* Main */}
      <main className="main" ref={mainRef}>
        {comp && preview ? (
          <>
            <div className="preview-title">
              {comp.name} / {preview.name}
            </div>
            <div className="iframe-wrapper" ref={wrapperRef}>
              <iframe
                ref={iframeRef}
                src="/frame.html"
                onLoad={sendRender}
              />
            </div>
            <div className="variant-labels">
              {preview.variants.map((v) => (
                <span key={v.label} className="variant-label">
                  {v.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">Select a component preview</div>
        )}
      </main>
    </div>
  )
}
