import { memo } from 'react'
import type { ReactNode } from 'react'
import { CENTERED_CONTENT_STYLE } from '../styles/constants.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IsolateWrapper } from './IframePreview.js'

export interface ComponentPreviewProps {
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
}

export const ComponentPreview = memo(function ComponentPreview({
	props,
	render,
	isolate,
}: ComponentPreviewProps) {
	return (
		<IsolateWrapper isolate={isolate}>
			<div style={CENTERED_CONTENT_STYLE}>
				<ErrorBoundary>{render(props)}</ErrorBoundary>
			</div>
		</IsolateWrapper>
	)
})
