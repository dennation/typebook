import { memo } from 'react'
import type { PropInfo } from '../../types.js'

export const PropControl = memo(function PropControl({
	prop,
	value,
	onChange,
}: {
	prop: PropInfo
	value: unknown
	onChange: (value: unknown) => void
}) {
	const { type } = prop

	if (type.kind === 'literal') {
		return (
			<select
				className="st:w-full st:text-xs st:bg-bg st:border st:border-border st:rounded st:px-2 st:py-1 st:text-text st:cursor-pointer"
				value={String(value ?? '')}
				onChange={(e) => onChange(e.target.value)}
			>
				{type.values.map((v) => (
					<option key={v} value={v}>
						{v}
					</option>
				))}
			</select>
		)
	}

	if (type.kind === 'boolean') {
		const checked = Boolean(value)
		return (
			<button
				type="button"
				className={`st:text-xs st:px-2 st:py-1 st:rounded st:border st:cursor-pointer st:transition-all ${
					checked
						? 'st:bg-accent st:text-white st:border-accent'
						: 'st:bg-bg st:text-text-muted st:border-border hover:st:bg-bg-hover'
				}`}
				onClick={() => onChange(!checked)}
			>
				{checked ? 'true' : 'false'}
			</button>
		)
	}

	if (type.kind === 'string' || type.kind === 'node') {
		return (
			<input
				type="text"
				className="st:w-full st:text-xs st:bg-bg st:border st:border-border st:rounded st:px-2 st:py-1 st:text-text"
				value={String(value ?? '')}
				onChange={(e) => onChange(e.target.value)}
			/>
		)
	}

	if (type.kind === 'number') {
		return (
			<input
				type="number"
				className="st:w-full st:text-xs st:bg-bg st:border st:border-border st:rounded st:px-2 st:py-1 st:text-text"
				value={Number(value ?? 0)}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		)
	}

	// function / unknown — no control rendered
	return null
})
