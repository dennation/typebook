import { useMemo } from 'react'
import type { Story, PropInfo } from '../../types.js'
import { resolveStory } from '../../resolve.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { VariantCard } from './VariantCard.js'
import { IframePreview } from './IframePreview.js'
import { getLayoutStyle } from '../utils/getLayoutStyle.js'

export function StoryRenderer({
  name,
  story,
  props,
}: {
  name: string
  story: Story
  props: PropInfo[]
}) {
  // Resolve variants lazily — only for this story
  const resolved = useMemo(() => resolveStory(name, story, props), [name, story, props])

  // Matrix story — render as table
  if (resolved.kind === 'matrix' && resolved.matrix) {
    return (
      <div className="st:overflow-x-auto">
        <table className="st:w-full st:border-collapse">
          <thead>
            <tr>
              <th className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-left" />
              {resolved.matrix.primaryValues.map((value) => (
                <th
                  key={value}
                  className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-center"
                >
                  {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resolved.matrix.rows.map((row) => (
              <tr key={row.label}>
                <td className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-left">
                  {row.label}
                </td>
                {row.variants.map((variant) => (
                  <td
                    key={`${row.label}-${variant.label}`}
                    className="st:border st:border-border st:p-0"
                  >
                    <IframePreview className="st:p-4">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
                        <ErrorBoundary>
                          {resolved.render(variant.props)}
                        </ErrorBoundary>
                      </div>
                    </IframePreview>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Single or variants story — render as grid
  const layoutStyle = getLayoutStyle(resolved)

  return (
    <div style={layoutStyle}>
      {resolved.variants?.map((variant) => (
        <VariantCard key={variant.label} variant={variant} render={resolved.render} />
      ))}
    </div>
  )
}
