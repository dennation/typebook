import { memo } from 'react'
import type { PropInfo } from '@/types.js'

const INPUT_CLASS =
	'st:w-full st:text-xs st:bg-transparent st:border st:border-border st:rounded-md st:px-2 st:py-1.5 st:text-text st:outline-none focus:st:border-accent st:transition-colors'

export interface PropInputProps {
	prop: PropInfo
	value: unknown
	onChange: (value: unknown) => void
}

export const PropInput = memo(function PropInput({ prop, value, onChange }: PropInputProps) {
	const { type } = prop

	if (type.kind === 'literal') {
		return (
			<select
				className={`${INPUT_CLASS} st:cursor-pointer`}
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
				className={`st:text-xs st:px-2.5 st:py-1.5 st:rounded-md st:border st:cursor-pointer st:transition-colors ${
					checked
						? 'st:bg-accent st:text-bg st:border-accent'
						: 'st:bg-transparent st:text-text-muted st:border-border hover:st:border-accent'
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
				className={INPUT_CLASS}
				value={String(value ?? '')}
				onChange={(e) => onChange(e.target.value)}
			/>
		)
	}

	if (type.kind === 'number') {
		return (
			<input
				type="number"
				className={INPUT_CLASS}
				value={Number(value ?? 0)}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		)
	}

	return null
})
