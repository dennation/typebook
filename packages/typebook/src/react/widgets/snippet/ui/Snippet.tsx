import { type ReactNode, useCallback, useState } from 'react'
import { CodeBlock, type CodeTheme } from '@react/features/code-block/index.js'
import { loadSnippet } from '../lib/loadSnippet.js'

export interface SnippetProps {
	/**
	 * Author-chosen identifier for this block. At build time the plugin extracts
	 * the children's source into `{snippetsDir}/{name}.txt`; at runtime this
	 * component fetches that file by the same name. Must be unique across the
	 * project. (Not `key` — reserved by React; not `codeId` — by request.)
	 */
	name: string
	/** Live content rendered above the "show source" toggle. */
	children: ReactNode
	/** URL path the extracted source is served from (default: '/code-blocks'). */
	basePath?: string
	/** Shiki light/dark theme override forwarded to the underlying CodeBlock. */
	theme?: CodeTheme
}

type LoadState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'loaded'; code: string }
	| { status: 'error'; message: string }

/**
 * Renders its children live, plus a toggle that lazily fetches and reveals the
 * original source the build step extracted for `name`.
 */
export function Snippet({ name, children, basePath, theme }: SnippetProps) {
	const [open, setOpen] = useState(false)
	const [state, setState] = useState<LoadState>({ status: 'idle' })

	const toggle = useCallback(() => {
		setOpen((wasOpen) => {
			const next = !wasOpen
			if (next && state.status === 'idle') {
				setState({ status: 'loading' })
				loadSnippet(name, basePath).then(
					(code) => setState({ status: 'loaded', code }),
					(err: Error) => setState({ status: 'error', message: err.message }),
				)
			}
			return next
		})
	}, [name, basePath, state.status])

	return (
		<div className="st:border st:border-border st:rounded-lg st:overflow-hidden">
			<div className="st:p-4">{children}</div>
			<div className="st:border-t st:border-border">
				<button
					type="button"
					onClick={toggle}
					aria-expanded={open}
					className="st:w-full st:text-left st:text-xs st:px-3 st:py-2 st:font-medium st:text-text-muted hover:st:text-text st:bg-bg-sidebar st:cursor-pointer st:transition-colors"
				>
					{open ? 'Hide source' : 'Show source'}
				</button>
				{open && (
					<div className="st:border-t st:border-border">
						{state.status === 'loaded' && <CodeBlock code={state.code} theme={theme} />}
						{state.status === 'loading' && (
							<p className="st:text-xs st:text-text-muted st:p-3 st:m-0">Loading source…</p>
						)}
						{state.status === 'error' && (
							<p className="st:text-xs st:text-red-500 st:p-3 st:m-0">{state.message}</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
