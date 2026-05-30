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
		<div className="st:relative st:group/code">
			<button
				type="button"
				onClick={handleCopy}
				className={`st:absolute st:top-2 st:right-2 st:z-10 st:transition-opacity st:text-[10px] st:px-1.5 st:py-0.5 st:rounded st:border st:border-border st:bg-bg-sidebar st:cursor-pointer ${
					copied
						? 'st:opacity-100 st:text-accent'
						: 'st:opacity-0 group-hover/code:st:opacity-100 st:text-text-muted hover:st:text-text'
				}`}
				title="Copy code"
			>
				{copied ? 'Copied!' : 'Copy'}
			</button>
			{html ? (
				<div
					className="st:text-xs st:overflow-x-auto [&_.shiki]:st:m-0 [&_.shiki]:st:p-3 [&_.shiki]:st:bg-transparent!"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<pre className="st:text-xs st:p-3 st:m-0 st:overflow-x-auto st:font-mono st:text-text-muted">
					<code>{code}</code>
				</pre>
			)}
		</div>
	)
}
