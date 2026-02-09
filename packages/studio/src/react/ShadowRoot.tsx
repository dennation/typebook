import { useRef, useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ShadowRootProps {
  children: ReactNode
  styles?: string
}

/**
 * Renders children inside a Shadow DOM to isolate Studio UI
 * from the user's global CSS.
 */
export function ShadowRoot({ children, styles }: ShadowRootProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: 'open' })
      setShadowRoot(shadow)
    }
  }, [])

  return (
    <div ref={hostRef} style={{ display: 'contents' }}>
      {shadowRoot &&
        createPortal(
          <>
            {styles && <style>{styles}</style>}
            {children}
          </>,
          shadowRoot,
        )}
    </div>
  )
}
