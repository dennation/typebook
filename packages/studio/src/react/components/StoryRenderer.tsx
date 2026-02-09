import type { ResolvedStory } from '../../types.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { getLayoutStyle } from '../utils/getLayoutStyle.js'

export function StoryRenderer({
  story,
  component: Component,
}: {
  story: ResolvedStory
  component: React.ComponentType<any>
}) {
  const layoutStyle = getLayoutStyle(story)

  return (
    <div style={layoutStyle}>
      {story.variants.map((variant, i) => (
        <div
          key={variant.label + i}
          className="st:flex st:flex-col st:items-center"
        >
          <ErrorBoundary>
            <Component {...variant.props} />
          </ErrorBoundary>
          <span className="st:text-xs st:text-text-muted st:mt-1.5 st:text-center">
            {variant.label}
          </span>
        </div>
      ))}
    </div>
  )
}
