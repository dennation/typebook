import type { Story, SingleStory, VariantsStory, MatrixStory, PropInfo } from '../../types.js'
import { resolveVariantConfig, getVariantProp } from '../../resolve.js'
import { VariantCard } from './VariantCard.js'
import { getGridStyle } from '../utils/getGridStyle.js'

export function StoryRenderer({ story, props }: { story: Story; props: PropInfo[] }) {
	switch (story.kind) {
		case 'single':
			return <RenderSingle story={story} />
		case 'variants':
			return <RenderVariants story={story} props={props} />
		case 'matrix':
			return <RenderMatrix story={story} props={props} />
	}
}

function mergeStoryProps(story: Story): Record<string, unknown> {
	return { ...story.defaults, ...story.props }
}

function RenderSingle({ story }: { story: SingleStory }) {
	return <VariantCard label="default" props={mergeStoryProps(story)} render={story.render} isolate={story.isolate} />
}

function RenderVariants({ story, props }: { story: VariantsStory; props: PropInfo[] }) {
	const variants = resolveVariantConfig(story.items, props, mergeStoryProps(story))

	return (
		<div style={getGridStyle(variants.length, story.columns)}>
			{variants.map((v) => (
				<VariantCard
					key={v.label}
					label={v.label}
					props={v.props}
					render={story.render}
					isolate={story.isolate}
				/>
			))}
		</div>
	)
}

function RenderMatrix({ story, props }: { story: MatrixStory; props: PropInfo[] }) {
	const baseProps = mergeStoryProps(story)

	const xVariants = resolveVariantConfig(story.x, props, {})
	if (xVariants.length === 0) return null

	const xProp = getVariantProp(story.x)
	const xValues = xVariants.map((v) => v.props[xProp])

	const rows: { label: string; cells: { label: string; props: Record<string, unknown> }[] }[] = []
	for (const yConfig of story.y) {
		const yVariants = resolveVariantConfig(yConfig, props, {})
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

	const HEADER_CELL = 'st:border-b st:border-border st:bg-bg-sidebar st:p-2.5 st:text-sm st:font-medium st:text-text-muted'

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
								<td className={`st:border-r st:border-border st:bg-bg-sidebar st:p-2.5 st:text-sm st:font-medium st:text-text-muted st:text-left ${isLastRow ? '' : 'st:border-b'}`}>
									{row.label}
								</td>
								{row.cells.map((cell) => (
									<td
										key={`${row.label}-${cell.label}`}
										className={`st:p-0 ${isLastRow ? '' : 'st:border-b st:border-border'}`}
									>
										<VariantCard
											label={cell.label}
											props={cell.props}
											render={story.render}
											isolate={story.isolate}
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
