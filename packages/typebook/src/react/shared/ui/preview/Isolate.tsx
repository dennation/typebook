import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LOG_PREFIX } from '@/constants.js'
import { IFRAME_STYLE } from '@react/shared/config/cssConstants.js'

type IframeFrameProps = PropsWithChildren<{
	className?: string
}>

function IframeFrame({ children, className }: IframeFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null)
	const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null)

	useEffect(() => {
		const iframe = iframeRef.current
		if (!iframe) return

		const handleLoad = () => {
			const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
			if (!iframeDoc) return

			Array.from(document.styleSheets).forEach((styleSheet) => {
				try {
					if (styleSheet.ownerNode instanceof HTMLStyleElement) {
						const style = iframeDoc.createElement('style')
						style.textContent = styleSheet.ownerNode.textContent
						iframeDoc.head.appendChild(style)
					} else if (styleSheet.href) {
						const link = iframeDoc.createElement('link')
						link.rel = 'stylesheet'
						link.href = styleSheet.href
						iframeDoc.head.appendChild(link)
					}
				} catch (e) {
					console.warn(LOG_PREFIX, 'Could not copy stylesheet:', e)
				}
			})

			const root = iframeDoc.getElementById('root')
			if (root) setIframeBody(root)
		}

		iframe.addEventListener('load', handleLoad)
		return () => iframe.removeEventListener('load', handleLoad)
	}, [])

	return (
		<>
			<iframe
				ref={iframeRef}
				className={className}
				srcDoc={`
					<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1">
						</head>
						<body style="margin: 0; padding: 0; overflow: auto;">
							<div id="root"></div>
						</body>
					</html>
				`}
				style={IFRAME_STYLE}
				title="Component Preview"
			/>
			{iframeBody && createPortal(children, iframeBody)}
		</>
	)
}

/** Wraps children in an isolated iframe when `isolate` is true, otherwise a plain div. */
export function Isolate({ isolate, children }: { isolate?: boolean; children: ReactNode }) {
	return isolate
		? <IframeFrame className="st:p-4">{children}</IframeFrame>
		: <div className="st:p-4">{children}</div>
}
