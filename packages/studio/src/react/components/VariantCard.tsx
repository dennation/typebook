import { memo } from 'react'
import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IframePreview } from './IframePreview.js'
import { CENTERED_CONTENT_STYLE } from '../styles/constants.js'

export const VariantCard = memo(function VariantCard({
	label,
	props,
	render,
	isolate,
}: {
	label: string
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
}) {
	const content = (
		<div style={CENTERED_CONTENT_STYLE}>
			<ErrorBoundary>{render(props)}</ErrorBoundary>
		</div>
	)

	return (
		<div className="st:relative st:glass-subtle st:rounded-xl st:overflow-hidden st:transition-all hover:st:shadow-lg">
			<span className="st:absolute st:top-1 st:left-1 st:text-[10px] st:text-text-muted st:bg-bg-sidebar st:px-1.5 st:py-px st:rounded-full st:border st:border-border st:z-10">
				{label}
			</span>
			{isolate ? (
				<IframePreview className="st:p-4">{content}</IframePreview>
			) : (
				<div className="st:p-4">{content}</div>
			)}
		</div>
	)
})
