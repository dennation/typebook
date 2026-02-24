import { useState, useCallback, useEffect } from 'react'
import type { ComponentEntry, PageResult } from '../../types.js'
import { toKebabCase, entryName } from '../utils/naming.js'

export type ActiveView =
	| { type: 'story'; component: string; story: string }
	| { type: 'componentPage'; component: string; page: string }
	| { type: 'page'; name: string }

export interface HashRouteState {
	activeView: ActiveView | null
	selectStory: (component: string, story: string) => void
	selectPage: (name: string) => void
	selectComponentPage: (component: string, page: string) => void
}

const PAGE_PREFIX = 'page/'

export function useHashRoute(
	components: ComponentEntry[],
	pages: PageResult[] = [],
	componentPages: Map<ComponentEntry, PageResult[]> = new Map(),
): HashRouteState {
	const [activeView, setActiveView] = useState<ActiveView | null>(null)

	const parseHash = useCallback((): ActiveView | null => {
		try {
			const hash = window.location.hash.slice(1)
			if (!hash) return null

			// Top-level page: #page/page-name
			if (hash.startsWith(PAGE_PREFIX)) {
				const kebabPage = decodeURIComponent(hash.slice(PAGE_PREFIX.length))
				const page = pages.find((p) => toKebabCase(p.name) === kebabPage)
				return page ? { type: 'page', name: page.name } : null
			}

			// Component page or story: #component/name
			const parts = hash.split('/')
			if (parts.length < 2) return null
			const kebabComp = decodeURIComponent(parts[0])
			const kebabName = decodeURIComponent(parts[1])

			const entry = components.find((e) => toKebabCase(entryName(e)) === kebabComp)
			if (!entry) return null

			// Component pages take priority (e.g. auto-generated Docs)
			const entryPages = componentPages.get(entry) ?? []
			const pageName = entryPages.find((p) => toKebabCase(p.name) === kebabName)?.name
			if (pageName) {
				return { type: 'componentPage', component: entryName(entry), page: pageName }
			}

			// Then check stories
			const storyName = Object.keys(entry.stories).find((s) => toKebabCase(s) === kebabName)
			if (storyName) {
				return { type: 'story', component: entryName(entry), story: storyName }
			}

			return null
		} catch {
			return null
		}
	}, [components, pages, componentPages])

	const selectStory = useCallback((component: string, story: string) => {
		setActiveView({ type: 'story', component, story })
		window.location.hash = `${toKebabCase(component)}/${toKebabCase(story)}`
	}, [])

	const selectPage = useCallback((name: string) => {
		setActiveView({ type: 'page', name })
		window.location.hash = `${PAGE_PREFIX}${toKebabCase(name)}`
	}, [])

	const selectComponentPage = useCallback((component: string, page: string) => {
		setActiveView({ type: 'componentPage', component, page })
		window.location.hash = `${toKebabCase(component)}/${toKebabCase(page)}`
	}, [])

	// Restore selection from URL hash on mount
	useEffect(() => {
		setActiveView(parseHash())
	}, [parseHash])

	// Sync with browser back/forward navigation
	useEffect(() => {
		const onHashChange = () => setActiveView(parseHash())
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [parseHash])

	return { activeView, selectStory, selectPage, selectComponentPage }
}
