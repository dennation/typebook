import { memo, useEffect } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { useStudioWrapper, useStudioMeta } from '../context.js'
import { useInspect } from '../context.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IsolateWrapper } from './IframePreview.js'
import { wrapActionProps } from '../utils/wrapActionProps.js'
import { CENTERED_CONTENT_STYLE } from '../styles/constants.js'

export interface ComponentPreviewProps {
	previewId: string
	component: ComponentType<any>
	props: Record<string, unknown>
	render: (props: any) => ReactNode
	isolate?: boolean
	/** When false, skips automatic action logging for function props */
	trackActions?: boolean
}

export const ComponentPreview = memo(function ComponentPreview({
	previewId,
	component,
	props,
	render,
	isolate,
	trackActions = true,
}: ComponentPreviewProps) {
	const storyWrapper = useStudioWrapper()
	const inspect = useInspect()
	const propsMap = useStudioMeta()
	const propInfos = propsMap.get(component)

	const wrappedProps = trackActions ? wrapActionProps(props, previewId, propInfos) : props
	const content = storyWrapper
		? storyWrapper(() => render(wrappedProps) as any)
		: render(wrappedProps)

	const isInspected = inspect?.inspectedPreviewId === previewId

	// Register props and propInfos in shared refs for InspectPanel to read
	useEffect(() => {
		const ref = inspect?.previewPropsRef
		if (!ref?.current) return
		ref.current.set(previewId, props)
		return () => {
			ref.current?.delete(previewId)
		}
	}, [inspect?.previewPropsRef, previewId, props])

	useEffect(() => {
		const ref = inspect?.previewPropInfosRef
		if (!ref?.current || !propInfos) return
		ref.current.set(previewId, propInfos)
		return () => {
			ref.current?.delete(previewId)
		}
	}, [inspect?.previewPropInfosRef, previewId, propInfos])

	return (
		<div className="st:relative">
			{inspect && (
				<button
					type="button"
					className={`st:absolute st:top-1.5 st:right-1.5 st:z-20 st:w-6 st:h-6 st:rounded st:text-[10px] st:cursor-pointer st:flex st:items-center st:justify-center st:border ${
						isInspected
							? 'st:bg-accent st:text-white st:border-accent'
							: 'st:bg-bg st:text-text-muted st:border-border hover:st:border-accent hover:st:text-accent'
					}`}
					title="Inspect"
					onClick={() => inspect.onInspect(previewId)}
				>
					&#9881;
				</button>
			)}
			<IsolateWrapper isolate={isolate}>
				<div style={CENTERED_CONTENT_STYLE}>
					<ErrorBoundary>{content}</ErrorBoundary>
				</div>
			</IsolateWrapper>
		</div>
	)
})
