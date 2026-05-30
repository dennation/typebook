import type { ReactNode } from 'react'
import { PreviewFrame } from '@react/shared/ui/preview/index.js'
import type { MatrixRow } from '../lib/buildMatrixRows.js'

const HEADER_CELL =
	'st:border-b st:border-border st:bg-bg-sidebar st:p-2.5 st:text-sm st:font-medium st:text-text-muted'

export interface MatrixTableProps {
	xLabels: string[]
	rows: MatrixRow[]
	render: (props: any) => ReactNode
	isolate?: boolean
}

export function MatrixTable({ xLabels, rows, render, isolate }: MatrixTableProps) {
	return (
		<div className="st:overflow-x-auto st:rounded-lg st:border st:border-border">
			<table className="st:w-full st:border-collapse">
				<thead>
					<tr>
						<th className={`${HEADER_CELL} st:border-r st:text-left`} />
						{xLabels.map((label) => (
							<th key={label} className={`${HEADER_CELL} st:text-center`}>
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
									className={`st:border-r st:border-border st:bg-bg-sidebar st:p-2.5 st:text-sm st:font-medium st:text-text-muted st:text-left ${
										isLastRow ? '' : 'st:border-b'
									}`}
								>
									{row.label}
								</td>
								{row.cells.map((cell) => (
									<td
										key={`${row.label}-${cell.label}`}
										className={`st:p-0 ${isLastRow ? '' : 'st:border-b st:border-border'}`}
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
