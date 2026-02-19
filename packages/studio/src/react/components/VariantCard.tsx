import type { ResolvedVariant } from '../../types.js'
import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IframePreview } from './IframePreview.js'

export function VariantCard({
  variant,
  component: Component,
  render,
}: {
  variant: ResolvedVariant
  component: React.ComponentType<any>
  render?: (props: Record<string, unknown>) => ReactNode
}) {
  const content = render ? render(variant.props) : <Component {...variant.props} />

  return (
    <div className="st:flex st:flex-col st:border st:border-dashed st:border-border st:rounded st:overflow-hidden">
      <IframePreview className="st:p-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
          <ErrorBoundary>
            {content}
          </ErrorBoundary>
        </div>
      </IframePreview>
      <span className="st:text-xs st:text-text-muted st:py-1.5 st:text-center st:bg-bg-sidebar st:border-t st:border-border">
        {variant.label}
      </span>
    </div>
  )
}
