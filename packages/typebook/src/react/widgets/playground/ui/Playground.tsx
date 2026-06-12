import { createElement, useCallback, useState } from 'react'
import type { ComponentHandle } from '@/types.js'
import { useComponentMeta } from '@react/entities/component-meta/index.js'
import { Preview } from '@react/shared/ui/preview/index.js'
import { PropsTable } from './PropsTable.js'

export interface PlaygroundProps {
	of: ComponentHandle<any>
}

export function Playground({ of }: PlaygroundProps) {
	const Component = of.component
	const meta = useComponentMeta(of.id)
	const allProps = meta?.props ?? []

	const [controlProps, setControlProps] = useState<Record<string, unknown>>(of.defaultProps)

	const handleChange = useCallback((propName: string, value: unknown) => {
		setControlProps((prev) => ({ ...prev, [propName]: value }))
	}, [])

	const render = useCallback((p: any) => createElement(Component, p), [Component])

	return (
		<div className="rounded-lg border border-border overflow-hidden mb-6">
			<div className="bg-bg-secondary">
				<Preview props={controlProps} render={render} />
			</div>
			<PropsTable props={allProps} values={controlProps} onChange={handleChange} />
		</div>
	)
}
