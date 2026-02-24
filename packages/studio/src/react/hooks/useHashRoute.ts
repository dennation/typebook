import { useState, useCallback, useEffect } from 'react'
import type { ComponentEntry, PageResult } from '../../types.js'
import { toKebabCase, entryName } from '../utils/naming.js'

export interface HashRouteState {
	activeComponent: string | null
	activeStory: string | null
	activePage: string | null
	activeComponentPage: string | null
	selectStory: (componentName: string, storyName: string) => void
	selectPage: (pageName: string) => void
	selectComponentPage: (componentName: string, pageName: string) => void
}

const PAGE_PREFIX = 'page/'

export function useHashRoute(
	components: ComponentEntry[],
	pages: PageResult[] = [],
	componentPages: Map<ComponentEntry, PageResult[]> = new Map(),
): HashRouteState {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)
	const [activeStory, setActiveStory] = useState<string | null>(null)
	const [activePage, setActivePage] = useState<string | null>(null)
	const [activeComponentPage, setActiveComponentPage] = useState<string | null>(null)

	// Resolve #component/name → component page or story
	const findByKebab = useCallback(
		(kebabComponent: string, kebabName: string) => {
			const entry = components.find((e) => toKebabCase(entryName(e)) === kebabComponent)
			if (!entry) return null

			// Component pages take priority (e.g. auto-generated Docs)
			const entryPages = componentPages.get(entry) ?? []
			const pageName = entryPages.find((p) => toKebabCase(p.name) === kebabName)?.name
			if (pageName) {
				return { type: 'componentPage' as const, component: entryName(entry), page: pageName }
			}

			// Then check stories
			const storyName = Object.keys(entry.stories).find((s) => toKebabCase(s) === kebabName)
			if (storyName) {
				return { type: 'story' as const, component: entryName(entry), story: storyName }
			}

			return null
		},
		[components, componentPages],
	)

	const findPageByKebab = useCallback(
		(kebabPage: string) => {
			const page = pages.find((p) => toKebabCase(p.name) === kebabPage)
			if (!page) return null
			return page.name
		},
		[pages],
	)

	type ParsedRoute =
		| { type: 'story'; component: string; story: string }
		| { type: 'page'; name: string }
		| { type: 'componentPage'; component: string; page: string }

	const parseHash = useCallback((): ParsedRoute | null => {
		try {
			const hash = window.location.hash.slice(1)
			if (!hash) return null

			// Top-level page: #page/page-name
			if (hash.startsWith(PAGE_PREFIX)) {
				const kebabPage = decodeURIComponent(hash.slice(PAGE_PREFIX.length))
				const name = findPageByKebab(kebabPage)
				if (!name) return null
				return { type: 'page', name }
			}

			// Component page or story: #component/name
			const parts = hash.split('/')
			if (parts.length < 2) return null
			const kebabComp = decodeURIComponent(parts[0])
			const kebabName = decodeURIComponent(parts[1])
			return findByKebab(kebabComp, kebabName)
		} catch {
			return null
		}
	}, [findByKebab, findPageByKebab])

	const selectStory = useCallback((componentName: string, storyName: string) => {
		setActiveComponent(componentName)
		setActiveStory(storyName)
		setActivePage(null)
		setActiveComponentPage(null)
		window.location.hash = `${toKebabCase(componentName)}/${toKebabCase(storyName)}`
	}, [])

	const selectPage = useCallback((pageName: string) => {
		setActivePage(pageName)
		setActiveComponent(null)
		setActiveStory(null)
		setActiveComponentPage(null)
		window.location.hash = `${PAGE_PREFIX}${toKebabCase(pageName)}`
	}, [])

	const selectComponentPage = useCallback((componentName: string, pageName: string) => {
		setActiveComponent(componentName)
		setActiveComponentPage(pageName)
		setActiveStory(null)
		setActivePage(null)
		window.location.hash = `${toKebabCase(componentName)}/${toKebabCase(pageName)}`
	}, [])

	const applyParsed = useCallback((parsed: ParsedRoute | null) => {
		if (!parsed) {
			setActiveComponent(null)
			setActiveStory(null)
			setActivePage(null)
			setActiveComponentPage(null)
			return
		}
		if (parsed.type === 'page') {
			setActivePage(parsed.name)
			setActiveComponent(null)
			setActiveStory(null)
			setActiveComponentPage(null)
		} else if (parsed.type === 'componentPage') {
			setActiveComponent(parsed.component)
			setActiveComponentPage(parsed.page)
			setActiveStory(null)
			setActivePage(null)
		} else {
			setActiveComponent(parsed.component)
			setActiveStory(parsed.story)
			setActivePage(null)
			setActiveComponentPage(null)
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

	return { activeComponent, activeStory, activePage, activeComponentPage, selectStory, selectPage, selectComponentPage }
}
