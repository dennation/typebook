export interface CodeTheme {
	light: string
	dark: string
}

export const DEFAULT_THEME: CodeTheme = { light: 'github-light', dark: 'github-dark' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let highlighterPromise: Promise<any> | null = null
let loadedThemes: string[] = []

export function getHighlighter(themes: CodeTheme): Promise<any> {
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
