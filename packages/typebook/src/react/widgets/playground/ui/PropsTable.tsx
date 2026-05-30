import { useMemo, useState } from 'react'
import type { PropInfo } from '@/types.js'
import { PropRow } from './PropRow.js'

export interface PropsTableProps {
	props: PropInfo[]
	values: Record<string, unknown>
	onChange: (propName: string, value: unknown) => void
}

export function PropsTable({ props, values, onChange }: PropsTableProps) {
	const [search, setSearch] = useState('')
	const [showInherited, setShowInherited] = useState(false)

	const hasInherited = useMemo(() => props.some((p) => p.inherited), [props])
	const filtered = useMemo(() => {
		return props
			.filter((p) => {
				if (!showInherited && p.inherited) return false
				if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
				return true
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [props, search, showInherited])

	return (
		<>
			{props.length > 0 && (
				<div className="st:border-t st:border-border st:flex st:items-center st:gap-3 st:px-4 st:py-2">
					<input
						type="text"
						placeholder="Search props..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="st:flex-1 st:bg-transparent st:border st:border-border st:rounded st:px-2.5 st:py-1.5 st:text-xs st:text-text st:placeholder-text-muted st:outline-none focus:st:border-text-muted"
					/>
					{hasInherited && (
						<label className="st:flex st:items-center st:gap-1.5 st:text-xs st:text-text-muted st:whitespace-nowrap st:cursor-pointer st:select-none">
							<input
								type="checkbox"
								checked={showInherited}
								onChange={(e) => setShowInherited(e.target.checked)}
								className="st:accent-text-muted"
							/>
							Show inherited
						</label>
					)}
				</div>
			)}

			<div className="st:border-t st:border-border">
				{filtered.length === 0 ? (
					<p className="st:text-xs st:text-text-muted st:p-3">
						{props.length === 0 ? 'No props' : 'No matching props'}
					</p>
				) : (
					<table className="st:w-full st:text-xs">
						<thead>
							<tr className="st:border-b st:border-border">
								<th className="st:text-left st:py-2.5 st:px-4 st:font-medium st:text-text-muted">
									Prop
								</th>
								<th className="st:text-left st:py-2.5 st:px-4 st:font-medium st:text-text-muted">
									Type
								</th>
								<th className="st:text-left st:py-2.5 st:px-4 st:font-medium st:text-text-muted">
									Control
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((prop) => (
								<PropRow
									key={prop.name}
									prop={prop}
									value={values[prop.name]}
									onChange={(value) => onChange(prop.name, value)}
								/>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	)
}
