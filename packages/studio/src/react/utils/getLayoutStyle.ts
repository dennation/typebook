import type { CSSProperties } from 'react'
import type { ResolvedStory } from '../../types.js'

export function getLayoutStyle(story: ResolvedStory): CSSProperties {
  const gap = 16
  if (story.columns) {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${story.columns}, 1fr)`,
      gap,
    }
  }
  return {
    display: 'flex',
    gap,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  }
}
