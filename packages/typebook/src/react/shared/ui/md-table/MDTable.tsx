import type { ReactNode } from "react";

export interface MDTableProps {
	head: ReactNode[];
	rows: ReactNode[][];
}

/** Responsive bordered table for markdown pipe tables. */
export function MDTable({ head, rows }: MDTableProps) {
	return (
		<div className="overflow-x-auto border border-border rounded-(--radius-token)">
			<table className="w-full border-collapse text-[14px] [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-bg-secondary">
				<thead>
					<tr>
						{head.map((h, i) => (
							<th
								// biome-ignore lint/suspicious/noArrayIndexKey: static columns
								key={i}
								className="text-left font-semibold text-fg px-4 py-2.75 bg-bg-secondary border-b border-border"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr
							// biome-ignore lint/suspicious/noArrayIndexKey: static rows
							key={i}
						>
							{r.map((c, j) => (
								<td
									// biome-ignore lint/suspicious/noArrayIndexKey: static cells
									key={j}
									className="px-4 py-2.75 border-b border-border text-fg-muted"
								>
									{c}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
