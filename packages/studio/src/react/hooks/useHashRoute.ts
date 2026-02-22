import { useState, useCallback, useEffect } from 'react'
import type { ComponentEntry, PageEntry } from '../../types.js'
import { DOCS_PAGE } from '../../constants.js'
import { toKebabCase, entryName } from '../utils/naming.js'

export interface HashRouteState {
	activeComponent: string | null
	activeStory: string | null
	activePage: string | null
	selectStory: (componentName: string, storyName: string) => void
	selectPage: (pageName: string) => void
}

const DOCS_KEBAB = toKebabCase(DOCS_PAGE)
const PAGE_PREFIX = 'page/'

export function useHashRoute(
	components: ComponentEntry[],
	pages: PageEntry[] = [],
): HashRouteState {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)
	const [activeStory, setActiveStory] = useState<string | null>(null)
	const [activePage, setActivePage] = useState<string | null>(null)

	const findByKebab = useCallback(
		(kebabComponent: string, kebabStory: string) => {
			const entry = components.find((e) => toKebabCase(entryName(e)) === kebabComponent)
			if (!entry) return null

			// Docs is a virtual page, not a real story
			if (kebabStory === DOCS_KEBAB) {
				return { component: entryName(entry), story: DOCS_PAGE }
			}

			const storyName = Object.keys(entry.stories).find((s) => toKebabCase(s) === kebabStory)
			if (!storyName) return null
			return { component: entryName(entry), story: storyName }
		},
		[components],
	)

	const findPageByKebab = useCallback(
		(kebabPage: string) => {
			const entry = pages.find((e) => toKebabCase(e.page.name) === kebabPage)
			if (!entry) return null
			return entry.page.name
		},
		[pages],
	)

	const parseHash = useCallback((): { type: 'story'; component: string; story: string } | { type: 'page'; name: string } | null => {
		try {
			const hash = window.location.hash.slice(1)
			if (!hash) return null

			// Check for page route: #page/page-name
			if (hash.startsWith(PAGE_PREFIX)) {
				const kebabPage = decodeURIComponent(hash.slice(PAGE_PREFIX.length))
				const name = findPageByKebab(kebabPage)
				if (!name) return null
				return { type: 'page', name }
			}

			const parts = hash.split('/')
			if (parts.length < 2) return null
			const kebabComp = decodeURIComponent(parts[0])
			const kebabStory = decodeURIComponent(parts[1])
			const result = findByKebab(kebabComp, kebabStory)
			if (!result) return null
			return { type: 'story', ...result }
		} catch {
			return null
		}
	}, [findByKebab, findPageByKebab])

	const selectStory = useCallback((componentName: string, storyName: string) => {
		setActiveComponent(componentName)
		setActiveStory(storyName)
		setActivePage(null)
		window.location.hash = `${toKebabCase(componentName)}/${toKebabCase(storyName)}`
	}, [])

	const selectPage = useCallback((pageName: string) => {
		setActivePage(pageName)
		setActiveComponent(null)
		setActiveStory(null)
		window.location.hash = `page/${toKebabCase(pageName)}`
	}, [])

	const applyParsed = useCallback((parsed: ReturnType<typeof parseHash>) => {
		if (!parsed) {
			setActiveComponent(null)
			setActiveStory(null)
			setActivePage(null)
			return
		}
		if (parsed.type === 'page') {
			setActivePage(parsed.name)
			setActiveComponent(null)
			setActiveStory(null)
		} else {
			setActiveComponent(parsed.component)
			setActiveStory(parsed.story)
			setActivePage(null)
		}
	}, [])

	// Restore selection from URL hash on mount
	useEffect(() => {
		applyParsed(parseHash())
	}, [parseHash, applyParsed])

	// Sync with browser back/forward navigation
	useEffect(() => {
		const onHashChange = () => {
			applyParsed(parseHash())
		}
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [parseHash, applyParsed])

	return { activeComponent, activeStory, activePage, selectStory, selectPage }
}
