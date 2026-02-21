import { useState, useCallback } from 'react'
import type { ComponentType } from 'react'
import type { PropInfo } from '../../types.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { PropControl } from './PropControl.js'

function formatType(prop: PropInfo): string {
	const { type } = prop
	if (type.kind === 'literal') return type.values.map((v) => `"${v}"`).join(' | ')
	if (type.kind === 'unknown' && type.raw) return type.raw
	return type.kind
}

function isControllable(prop: PropInfo): boolean {
	const k = prop.type.kind
	return k === 'literal' || k === 'boolean' || k === 'string' || k === 'number' || k === 'node'
}

export function ComponentPreview({
	component: Component,
	defaults,
	props,
}: {
	component: ComponentType<any>
	defaults: Record<string, unknown>
	props: PropInfo[]
}) {
	const [controlProps, setControlProps] = useState<Record<string, unknown>>(defaults)

	const handleChange = useCallback((propName: string, value: unknown) => {
		setControlProps((prev) => ({ ...prev, [propName]: value }))
	}, [])

	return (
		<div className="st:glass-subtle st:rounded-xl st:overflow-hidden st:mb-6">
			{/* Preview — full width */}
			<div className="st:bg-checkered st:flex st:items-center st:justify-center st:min-h-[120px] st:p-6">
				<ErrorBoundary>
					<Component {...controlProps} />
				</ErrorBoundary>
			</div>

			{/* Props table — below */}
			<div className="st:border-t st:border-border st:bg-bg-sidebar">
				{props.length === 0 ? (
					<p className="st:text-xs st:text-text-muted st:p-3">No props</p>
				) : (
					<table className="st:w-full st:text-xs">
						<thead>
							<tr className="st:border-b st:border-border">
								<th className="st:text-left st:py-2 st:px-3 st:font-semibold st:text-text-muted">
									Prop
								</th>
								<th className="st:text-left st:py-2 st:px-3 st:font-semibold st:text-text-muted">
									Type
								</th>
								<th className="st:text-left st:py-2 st:px-3 st:font-semibold st:text-text-muted">
									Control
								</th>
							</tr>
						</thead>
						<tbody>
							{props.map((prop) => (
								<tr
									key={prop.name}
									className="st:border-b st:border-border last:st:border-b-0 hover:st:bg-bg-hover st:transition-colors"
								>
									<td className="st:py-2 st:px-3 st:font-mono st:text-accent st:whitespace-nowrap">
										{prop.name}
										{!prop.optional && (
											<span className="st:text-red-400 st:ml-0.5">*</span>
										)}
									</td>
									<td
										className="st:py-2 st:px-3 st:font-mono st:text-text-muted st:max-w-[200px] st:truncate"
										title={formatType(prop)}
									>
										{formatType(prop)}
									</td>
									<td className="st:py-2 st:px-3">
										{isControllable(prop) ? (
											<PropControl
												prop={prop}
												value={controlProps[prop.name]}
												onChange={(val) => handleChange(prop.name, val)}
											/>
										) : (
											<span className="st:text-text-muted">—</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}
