import type { PropInfo } from '@/types.js'
import { PropInput } from '@react/features/prop-input/index.js'
import { formatPropType, isControllable } from '../lib/formatPropType.js'

export interface PropRowProps {
	prop: PropInfo
	value: unknown
	onChange: (value: unknown) => void
}

export function PropRow({ prop, value, onChange }: PropRowProps) {
	const typeText = formatPropType(prop)
	return (
		<tr className="st:border-b st:border-border last:st:border-b-0">
			<td className={`st:py-2.5 st:px-4 st:font-mono st:whitespace-nowrap ${prop.inherited ? 'st:text-text-muted' : 'st:text-text'}`}>
				{prop.name}
				{!prop.optional && <span className="st:text-red-400 st:ml-0.5">*</span>}
			</td>
			<td
				className="st:py-2.5 st:px-4 st:font-mono st:text-text-muted st:max-w-[200px] st:truncate"
				title={typeText}
			>
				{typeText}
			</td>
			<td className="st:py-2.5 st:px-4">
				{isControllable(prop) ? (
					<PropInput prop={prop} value={value} onChange={onChange} />
				) : (
					<span className="st:text-text-muted">—</span>
				)}
			</td>
		</tr>
	)
}
