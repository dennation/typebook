import { useState } from 'react'
import type { ResolvedComponent } from '../../types.js'
import { IframePreview } from './IframePreview.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { PropControl } from './PropControl.js'

export function ComponentPreview({ comp }: { comp: ResolvedComponent }) {
  const [controlProps, setControlProps] = useState<Record<string, unknown>>(comp.defaults)

  const controllableProps = (comp.props ?? []).filter((p) => {
    const k = p.type.kind
    return k === 'literal' || k === 'boolean' || k === 'string' || k === 'number' || k === 'node'
  })

  const handleChange = (propName: string, value: unknown) => {
    setControlProps((prev) => ({ ...prev, [propName]: value }))
  }

  const Component = comp.component

  return (
    <div className="st:grid st:grid-cols-[1fr_240px] st:border st:border-border st:rounded-lg st:overflow-hidden st:mb-6">
      {/* Preview */}
      <div className="st:border-r st:border-border">
        <IframePreview>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', padding: '24px' }}>
            <ErrorBoundary>
              <Component {...controlProps} />
            </ErrorBoundary>
          </div>
        </IframePreview>
      </div>

      {/* Controls */}
      <div className="st:bg-bg-sidebar st:p-3 st:overflow-y-auto">
        {controllableProps.length === 0 ? (
          <p className="st:text-xs st:text-text-muted">No controllable props</p>
        ) : (
          <div className="st:flex st:flex-col st:gap-2">
            {controllableProps.map((prop) => (
              <div key={prop.name}>
                <div className="st:text-xs st:font-mono st:text-text-muted st:mb-1">{prop.name}</div>
                <PropControl
                  prop={prop}
                  value={controlProps[prop.name]}
                  onChange={(val) => handleChange(prop.name, val)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
