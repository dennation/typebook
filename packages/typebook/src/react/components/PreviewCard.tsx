import { memo } from 'react'
import type { ReactNode } from 'react'
import { ComponentPreview } from './ComponentPreview.js'

export interface PreviewCardProps {
	label: string
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
}

export const PreviewCard = memo(function PreviewCard({
	label,
	props,
	render,
	isolate,
}: PreviewCardProps) {
	return (
		<div className="st:relative st:bg-bg-sidebar st:rounded-lg st:overflow-hidden">
			<span className="st:absolute st:top-1 st:left-1 st:text-[10px] st:text-text-muted st:bg-bg st:px-1.5 st:py-px st:rounded-full st:z-10">
				{label}
			</span>
			<ComponentPreview props={props} render={render} isolate={isolate} />
		</div>
	)
})
