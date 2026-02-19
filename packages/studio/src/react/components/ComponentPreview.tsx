import { useState } from 'react'
import type { ResolvedComponent, PropInfo } from '../../types.js'
import { IframePreview } from './IframePreview.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { PropControl } from './PropControl.js'

function formatType(prop: PropInfo): string {
  const { type } = prop
  if (type.kind === 'literal') return type.values.map(v => `"${v}"`).join(' | ')
  if (type.kind === 'unknown' && type.raw) return type.raw
  return type.kind
}

function isControllable(prop: PropInfo): boolean {
  const k = prop.type.kind
  return k === 'literal' || k === 'boolean' || k === 'string' || k === 'number' || k === 'node'
}

export function ComponentPreview({ comp }: { comp: ResolvedComponent }) {
  const [controlProps, setControlProps] = useState<Record<string, unknown>>(comp.defaults)

  const handleChange = (propName: string, value: unknown) => {
    setControlProps((prev) => ({ ...prev, [propName]: value }))
  }

  const props = comp.props ?? []
  const Component = comp.component

  return (
    <div className="st:grid st:grid-cols-[1fr_320px] st:border st:border-border st:rounded-lg st:overflow-hidden st:mb-6">
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

      {/* Props panel */}
      <div className="st:bg-bg-sidebar st:overflow-y-auto">
        {props.length === 0 ? (
          <p className="st:text-xs st:text-text-muted st:p-3">No props</p>
        ) : (
          <table className="st:w-full st:text-xs">
            <thead>
              <tr className="st:border-b st:border-border">
                <th className="st:text-left st:py-1.5 st:px-2 st:font-semibold st:text-text-muted">Prop</th>
                <th className="st:text-left st:py-1.5 st:px-2 st:font-semibold st:text-text-muted">Type</th>
                <th className="st:text-left st:py-1.5 st:px-2 st:font-semibold st:text-text-muted">Control</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => (
                <tr key={prop.name} className="st:border-b st:border-border">
                  <td className="st:py-1.5 st:px-2 st:font-mono st:text-accent st:whitespace-nowrap">
                    {prop.name}
                    {!prop.optional && <span className="st:text-red-400 st:ml-0.5">*</span>}
                  </td>
                  <td className="st:py-1.5 st:px-2 st:font-mono st:text-text-muted st:max-w-[100px] st:truncate" title={formatType(prop)}>
                    {formatType(prop)}
                  </td>
                  <td className="st:py-1.5 st:px-2">
                    {isControllable(prop) ? (
                      <PropControl
                        prop={prop}
                        value={controlProps[prop.name]}
                        onChange={(val) => handleChange(prop.name, val)}
                      />
                    ) : (
                      <span className="st:text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
