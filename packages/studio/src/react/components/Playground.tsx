import { useState, useCallback, createElement } from 'react'
import type { DefineResult, PropInfo } from '../../types.js'
import { useStudioMeta } from '../context.js'
import { PropControl } from './PropControl.js'
import { ComponentPreview } from './ComponentPreview.js'

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

export function Playground({ of: config }: { of: DefineResult<any> }) {
	const metaMap = useStudioMeta()
	const allProps: PropInfo[] = metaMap.get(config.component)?.props ?? []
	const Component = config.component

	const [controlProps, setControlProps] = useState<Record<string, unknown>>(config.defaults)
	const [search, setSearch] = useState('')
	const [showInherited, setShowInherited] = useState(false)

	const hasInherited = allProps.some((p) => p.inherited)
	const filteredProps = allProps
		.filter((p) => {
			if (!showInherited && p.inherited) return false
			if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
			return true
		})
		.slice()
		.sort((a: PropInfo, b: PropInfo) => a.name.localeCompare(b.name))

	const handleChange = useCallback((propName: string, value: unknown) => {
		setControlProps((prev) => ({ ...prev, [propName]: value }))
	}, [])

	return (
		<div className="st:rounded-lg st:border st:border-border st:overflow-hidden st:mb-6">
			{/* Preview */}
			<div className="st:bg-bg-sidebar">
				<ComponentPreview
					previewId="playground"
					component={Component}
					props={controlProps}
					render={(p) => createElement(Component, p)}
					trackActions={config.trackActions}
				/>
			</div>

			{/* Toolbar */}
			{allProps.length > 0 && (
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

			{/* Props table */}
			<div className="st:border-t st:border-border">
				{filteredProps.length === 0 ? (
					<p className="st:text-xs st:text-text-muted st:p-3">
						{allProps.length === 0 ? 'No props' : 'No matching props'}
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
							{filteredProps.map((prop: PropInfo) => (
								<tr
									key={prop.name}
									className="st:border-b st:border-border last:st:border-b-0"
								>
									<td className={`st:py-2.5 st:px-4 st:font-mono st:whitespace-nowrap ${prop.inherited ? 'st:text-text-muted' : 'st:text-text'}`}>
										{prop.name}
										{!prop.optional && (
											<span className="st:text-red-400 st:ml-0.5">*</span>
										)}
									</td>
									<td
										className="st:py-2.5 st:px-4 st:font-mono st:text-text-muted st:max-w-[200px] st:truncate"
										title={formatType(prop)}
									>
										{formatType(prop)}
									</td>
									<td className="st:py-2.5 st:px-4">
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
