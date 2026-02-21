import { useState, useCallback, useEffect } from 'react'
import type { ComponentEntry } from '../../types.js'
import { DOCS_PAGE } from '../../constants.js'
import { toKebabCase, entryName } from '../utils/naming.js'

export interface HashRouteState {
	activeComponent: string | null
	activeStory: string | null
	selectStory: (componentName: string, storyName: string) => void
}

const DOCS_KEBAB = toKebabCase(DOCS_PAGE)

export function useHashRoute(components: ComponentEntry[]): HashRouteState {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)
	const [activeStory, setActiveStory] = useState<string | null>(null)

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

	const parseHash = useCallback((): { component: string; story: string } | null => {
		try {
			const hash = window.location.hash.slice(1)
			if (!hash) return null
			const parts = hash.split('/')
			if (parts.length < 2) return null
			const kebabComp = decodeURIComponent(parts[0])
			const kebabStory = decodeURIComponent(parts[1])
			return findByKebab(kebabComp, kebabStory)
		} catch {
			return null
		}
	}, [findByKebab])

	const selectStory = useCallback((componentName: string, storyName: string) => {
		setActiveComponent(componentName)
		setActiveStory(storyName)
		window.location.hash = `${toKebabCase(componentName)}/${toKebabCase(storyName)}`
	}, [])

	// Restore selection from URL hash on mount
	useEffect(() => {
		const parsed = parseHash()
		if (!parsed) return
		setActiveComponent(parsed.component)
		setActiveStory(parsed.story)
	}, [parseHash])

	// Sync with browser back/forward navigation
	useEffect(() => {
		const onHashChange = () => {
			const parsed = parseHash()
			if (!parsed) {
				setActiveComponent(null)
				setActiveStory(null)
				return
			}
			setActiveComponent(parsed.component)
			setActiveStory(parsed.story)
		}
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [parseHash])

	return { activeComponent, activeStory, selectStory }
}
