import { PreviewFrame } from "@react/shared/ui/preview/index";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";
import type { MatrixRow } from "../lib/buildMatrixRows";

const matrixTable = tv({
	slots: {
		root: "overflow-x-auto rounded-lg border border-border",
		table: "w-full border-collapse",
		headerCell:
			"border-b border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted",
		cornerCell:
			"border-b border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted border-r text-left",
		columnHead:
			"border-b border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted text-center",
		rowHead:
			"border-r border-border bg-bg-secondary p-2.5 text-sm font-medium text-fg-muted text-left",
		bodyCell: "p-0",
	},
	variants: {
		lastRow: {
			false: {
				rowHead: "border-b",
				bodyCell: "border-b border-border",
			},
			true: {},
		},
	},
	defaultVariants: { lastRow: false },
});

export interface MatrixTableProps {
	xLabels: string[];
	rows: MatrixRow[];
	render: (props: any) => ReactNode;
	isolate?: boolean;
}

export function MatrixTable({
	xLabels,
	rows,
	render,
	isolate,
}: MatrixTableProps) {
	const { root, table, cornerCell, columnHead } = matrixTable();
	return (
		<div className={root()}>
			<table className={table()}>
				<thead>
					<tr>
						<th className={cornerCell()} />
						{xLabels.map((label) => (
							<th key={label} className={columnHead()}>
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIdx) => {
						const isLastRow = rowIdx === rows.length - 1;
						const { rowHead, bodyCell } = matrixTable({ lastRow: isLastRow });
						return (
							<tr key={row.label}>
								<td className={rowHead()}>{row.label}</td>
								{row.cells.map((cell) => (
									<td key={`${row.label}-${cell.label}`} className={bodyCell()}>
										<PreviewFrame
											label={cell.label}
											props={cell.props}
											render={render}
											isolate={isolate}
										/>
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
