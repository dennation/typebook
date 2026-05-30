import { memo } from 'react'
import type { ReactNode } from 'react'
import { CENTERED_CONTENT_STYLE } from '@react/shared/config/cssConstants.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { Isolate } from './Isolate.js'

export interface PreviewProps {
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
}

export const Preview = memo(function Preview({ props, render, isolate }: PreviewProps) {
	return (
		<Isolate isolate={isolate}>
			<div style={CENTERED_CONTENT_STYLE}>
				<ErrorBoundary>{render(props)}</ErrorBoundary>
			</div>
		</Isolate>
	)
})
