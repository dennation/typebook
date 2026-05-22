import { createElement } from 'react'
import { getVariantProp, resolveVariantConfig } from '../../resolve.js'
import type { MissingProps, Registration, VariantConfig } from '../../types.js'
import { useRegistration } from '../hooks/useRegistration.js'
import { PreviewCard } from './PreviewCard.js'

export type MatrixStoryProps<Props, CoveredByDefaults extends keyof Props> = {
	of: Registration<Props, CoveredByDefaults>
	x: VariantConfig
	y: VariantConfig[]
	isolate?: boolean
} & (
	keyof MissingProps<Props, CoveredByDefaults> extends never
		? { props?: Partial<Props> }
		: { props: Partial<Props> & MissingProps<Props, CoveredByDefaults> }
)

const HEADER_CELL =
	'st:border-b st:border-border st:bg-bg-sidebar st:p-2.5 st:text-sm st:font-medium st:text-text-muted'

export function MatrixStory<Props, CoveredByDefaults extends keyof Props = never>(
	{ of, x, y, props, isolate }: MatrixStoryProps<Props, CoveredByDefaults>,
) {
	const { Component, propInfos, defaultProps } = useRegistration(of)

	const baseProps: Record<string, unknown> = {
		...defaultProps,
		...(props as Record<string, unknown> | undefined),
	}

	const xVariants = resolveVariantConfig(x, propInfos, {})
	if (xVariants.length === 0) return null

	const xProp = getVariantProp(x)
	const xValues = xVariants.map((v) => v.props[xProp])

	const rows: Array<{ label: string; cells: Array<{ label: string; props: Record<string, unknown> }> }> = []
	for (const yConfig of y) {
		const yVariants = resolveVariantConfig(yConfig, propInfos, {})
		if (yVariants.length === 0) continue

		const yProp = getVariantProp(yConfig)

		for (const yVariant of yVariants) {
			const yValue = yVariant.props[yProp]
			rows.push({
				label: String(yValue),
				cells: xValues.map((xValue) => ({
					label: String(xValue),
					props: { ...baseProps, [xProp]: xValue, [yProp]: yValue },
				})),
			})
		}
	}

	return (
		<div className="st:overflow-x-auto st:rounded-lg st:border st:border-border">
			<table className="st:w-full st:border-collapse">
				<thead>
					<tr>
						<th className={`${HEADER_CELL} st:border-r st:text-left`} />
						{xValues.map((value) => (
							<th key={String(value)} className={`${HEADER_CELL} st:text-center`}>
								{String(value)}
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
										<PreviewCard
											label={cell.label}
											component={Component}
											props={cell.props}
											render={(p) => createElement(Component, p)}
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
