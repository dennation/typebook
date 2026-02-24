import { memo } from 'react'
import type { ReactNode } from 'react'
import { useStudioWrapper } from '../context.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IsolateWrapper } from './IframePreview.js'
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
	const storyWrapper = useStudioWrapper()
	const content = storyWrapper ? storyWrapper(() => render(props) as any) : render(props)

	return (
		<div className="st:relative st:bg-bg-sidebar st:rounded-lg st:overflow-hidden">
			<span className="st:absolute st:top-1 st:left-1 st:text-[10px] st:text-text-muted st:bg-bg st:px-1.5 st:py-px st:rounded-full st:z-10">
				{label}
			</span>
			<IsolateWrapper isolate={isolate}>
				<div style={CENTERED_CONTENT_STYLE}>
					<ErrorBoundary>{content}</ErrorBoundary>
				</div>
			</IsolateWrapper>
		</div>
	)
})
