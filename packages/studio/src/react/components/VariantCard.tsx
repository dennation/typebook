import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IframePreview } from './IframePreview.js'

export function VariantCard({
  label,
  props,
  render,
  isolate,
}: {
  label: string
  props: Record<string, unknown>
  render: (props: any) => ReactNode
  isolate?: boolean
}) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
      <ErrorBoundary>
        {render(props)}
      </ErrorBoundary>
    </div>
  )

  return (
    <div className="st:flex st:flex-col st:border st:border-dashed st:border-border st:rounded st:overflow-hidden">
      {isolate
        ? <IframePreview className="st:p-3">{content}</IframePreview>
        : <div className="st:p-3">{content}</div>}
      <span className="st:text-xs st:text-text-muted st:py-1.5 st:text-center st:bg-bg-sidebar st:border-t st:border-border">
        {label}
      </span>
    </div>
  )
}
