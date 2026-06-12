import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_THEME, getHighlighter, type CodeTheme } from '../lib/highlighter.js'

export interface CodeBlockProps {
	code: string
	theme?: CodeTheme
}

export function CodeBlock({ code, theme = DEFAULT_THEME }: CodeBlockProps) {
	const [html, setHtml] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		getHighlighter(theme).then((highlighter) => {
			if (cancelled) return
			const result = highlighter.codeToHtml(code, {
				lang: 'tsx',
				themes: { light: theme.light, dark: theme.dark },
				defaultColor: false,
			})
			setHtml(result)
		})

		return () => {
			cancelled = true
		}
	}, [code, theme])

	const [copied, setCopied] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code)
		setCopied(true)
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => setCopied(false), 1500)
	}, [code])

	return (
		<div className="relative group/code">
			<button
				type="button"
				onClick={handleCopy}
				className={`absolute top-2 right-2 z-10 transition-opacity text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg-secondary cursor-pointer ${
					copied
						? 'opacity-100 text-accent'
						: 'opacity-0 group-hover/code:opacity-100 text-fg-muted hover:text-fg'
				}`}
				title="Copy code"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>
			{html ? (
				<div
					className="text-xs overflow-x-auto [&_.shiki]:m-0 [&_.shiki]:p-3 [&_.shiki]:bg-transparent!"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<pre className="text-xs p-3 m-0 overflow-x-auto font-mono text-fg-muted">
					<code>{code}</code>
				</pre>
			)}
		</div>
	)
}
