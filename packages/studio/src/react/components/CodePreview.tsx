import { useEffect, useState, useCallback } from 'react'
import { useCodeTheme, type CodeThemeConfig } from '../context.js'

// --- Shiki singleton highlighter ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let highlighterPromise: Promise<any> | null = null
let loadedThemes: string[] = []

function getHighlighter(themes: CodeThemeConfig): Promise<any> {
	const needed = [themes.light, themes.dark]
	const needsReload = needed.some((t) => !loadedThemes.includes(t))

	if (!highlighterPromise || needsReload) {
		highlighterPromise = import('shiki').then((mod) =>
			mod.createHighlighter({ themes: needed, langs: ['tsx'] }),
		)
		loadedThemes = needed
	}

	return highlighterPromise
}

// --- Component ---

export interface CodePreviewProps {
	code: string
}

export function CodePreview({ code }: CodePreviewProps) {
	const themes = useCodeTheme()
	const [html, setHtml] = useState<string | null>(null)

	useEffect(() => {
		let cancelled = false

		getHighlighter(themes).then((highlighter) => {
			if (cancelled) return
			const result = highlighter.codeToHtml(code, {
				lang: 'tsx',
				themes: { light: themes.light, dark: themes.dark },
				defaultColor: false,
			})
			setHtml(result)
		})

		return () => {
			cancelled = true
		}
	}, [code, themes])

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(code)
	}, [code])

	return (
		<div className="st:relative st:group/code">
			<button
				type="button"
				onClick={handleCopy}
				className="st:absolute st:top-2 st:right-2 st:z-10 st:opacity-0 group-hover/code:st:opacity-100 st:transition-opacity st:text-[10px] st:px-1.5 st:py-0.5 st:rounded st:border st:border-border st:bg-bg-sidebar st:text-text-muted hover:st:text-text st:cursor-pointer"
				title="Copy code"
			>
				Copy
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
