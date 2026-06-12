import type { ReactNode } from 'react'
import { PreviewFrame } from '@react/shared/ui/preview/index.js'
import type { MatrixRow } from '../lib/buildMatrixRows.js'

const HEADER_CELL =
	'border-b border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted'

export interface MatrixTableProps {
	xLabels: string[]
	rows: MatrixRow[]
	render: (props: any) => ReactNode
	isolate?: boolean
}

export function MatrixTable({ xLabels, rows, render, isolate }: MatrixTableProps) {
	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full border-collapse">
				<thead>
					<tr>
						<th className={`${HEADER_CELL} border-r text-left`} />
						{xLabels.map((label) => (
							<th key={label} className={`${HEADER_CELL} text-center`}>
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIdx) => {
						const isLastRow = rowIdx === rows.length - 1
						return (
							<tr key={row.label}>
								<td
									className={`border-r border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted text-left ${
										isLastRow ? '' : 'border-b'
									}`}
								>
									{row.label}
								</td>
								{row.cells.map((cell) => (
									<td
										key={`${row.label}-${cell.label}`}
										className={`p-0 ${isLastRow ? '' : 'border-b border-border'}`}
									>
										<PreviewFrame
											label={cell.label}
											props={cell.props}
											render={render}
											isolate={isolate}
										/>
									</td>
								))}
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
