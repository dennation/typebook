import type { CSSProperties } from 'react'
import type { ResolvedStory } from '../../types.js'

export function getLayoutStyle(story: ResolvedStory): CSSProperties {
  const gap = 16
  const variantCount = story.variants?.length

  if (story.columns) {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${story.columns}, 1fr)`,
      gap,
    }
  }

  // Auto layout: distribute variants evenly across width
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${variantCount ?? 1}, 1fr)`,
    gap,
  }
}
