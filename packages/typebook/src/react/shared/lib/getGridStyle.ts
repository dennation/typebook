import type { CSSProperties } from 'react'

const MAX_AUTO_COLUMNS = 3

function autoColumns(count: number): number {
	if (count <= MAX_AUTO_COLUMNS) return count
	for (let cols = MAX_AUTO_COLUMNS; cols >= 2; cols--) {
		if (count % cols === 0) return cols
	}
	return MAX_AUTO_COLUMNS
}

export function getGridStyle(count: number, columns?: number): CSSProperties {
	const gap = 16

	return {
		display: 'grid',
		gridTemplateColumns: `repeat(${columns ?? autoColumns(count)}, 1fr)`,
		gap,
	}
}
