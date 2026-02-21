import type { CSSProperties } from 'react'

export function getGridStyle(count: number, columns?: number): CSSProperties {
  const gap = 16

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns ?? count}, 1fr)`,
    gap,
  }
}
