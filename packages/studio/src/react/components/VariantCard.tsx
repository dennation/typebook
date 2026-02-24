import { memo } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { ComponentPreview } from './ComponentPreview.js'

export const VariantCard = memo(function VariantCard({
	label,
	previewId,
	component,
	props,
	render,
	isolate,
	trackActions,
}: {
	label: string
	previewId: string
	component: ComponentType<any>
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
	trackActions?: boolean
}) {
	return (
		<div className="st:relative st:bg-bg-sidebar st:rounded-lg st:overflow-hidden">
			<span className="st:absolute st:top-1 st:left-1 st:text-[10px] st:text-text-muted st:bg-bg st:px-1.5 st:py-px st:rounded-full st:z-10">
				{label}
			</span>
			<ComponentPreview
				previewId={previewId}
				component={component}
				props={props}
				render={render}
				isolate={isolate}
				trackActions={trackActions}
			/>
		</div>
	)
})
