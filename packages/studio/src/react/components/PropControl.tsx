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
				className="st:w-full st:text-xs st:glass-input st:rounded-lg st:px-2.5 st:py-1.5 st:text-text st:cursor-pointer st:outline-none focus:st:border-accent st:transition-all"
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
				className={`st:text-xs st:px-3 st:py-1.5 st:rounded-full st:border st:cursor-pointer st:transition-all ${
					checked
						? 'st:bg-accent st:text-white st:border-accent st:shadow-sm'
						: 'st:glass-input st:text-text-muted hover:st:bg-bg-hover'
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
				className="st:w-full st:text-xs st:glass-input st:rounded-lg st:px-2.5 st:py-1.5 st:text-text st:outline-none focus:st:border-accent st:transition-all"
				value={String(value ?? '')}
				onChange={(e) => onChange(e.target.value)}
			/>
		)
	}

	if (type.kind === 'number') {
		return (
			<input
				type="number"
				className="st:w-full st:text-xs st:glass-input st:rounded-lg st:px-2.5 st:py-1.5 st:text-text st:outline-none focus:st:border-accent st:transition-all"
				value={Number(value ?? 0)}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		)
	}

	// function / unknown — no control rendered
	return null
})
