import type { ResolvedStory } from '../../types.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { VariantCard } from './VariantCard.js'
import { IframePreview } from './IframePreview.js'
import { getLayoutStyle } from '../utils/getLayoutStyle.js'

export function StoryRenderer({
  story,
  component: Component,
}: {
  story: ResolvedStory
  component: React.ComponentType<any>
}) {
  // Matrix story — render as table
  if (story.kind === 'matrix' && story.matrix) {
    return (
      <div className="st:overflow-x-auto">
        <table className="st:w-full st:border-collapse">
          <thead>
            <tr>
              <th className="st:border st:border-border st:bg-bg-sidebar st:p-2 st:text-sm st:font-semibold st:text-left" />
              {story.matrix.primaryValues.map((value) => (
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
            {story.matrix.rows.map((row) => (
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
                          <Component {...variant.props} />
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

  // Static or variants story — render as grid
  const layoutStyle = getLayoutStyle(story)

  return (
    <div style={layoutStyle}>
      {story.variants?.map((variant) => (
        <VariantCard key={variant.label} variant={variant} component={Component} />
      ))}
    </div>
  )
}
