import { useState, useCallback, useEffect } from 'react'
import type { RegistryEntry } from '../../types.js'
import { toKebabCase, entryName } from './naming.js'

export interface HashRouteState {
	activeComponent: string | null
	selectStory: (componentName: string, storyName: string) => void
}

export function useHashRoute(registry: RegistryEntry[]): HashRouteState {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)

	const findByKebab = useCallback(
		(kebabComponent: string, kebabStory: string) => {
			const entry = registry.find((e) => toKebabCase(entryName(e)) === kebabComponent)
			if (!entry) return null
			const storyName = Object.keys(entry.stories).find((s) => toKebabCase(s) === kebabStory)
			if (!storyName) return null
			return { component: entryName(entry), story: storyName }
		},
		[registry],
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
		window.location.hash = `${toKebabCase(componentName)}/${toKebabCase(storyName)}`
	}, [])

	// Restore selection from URL hash on mount
	useEffect(() => {
		const parsed = parseHash()
		if (!parsed) return
		setActiveComponent(parsed.component)
	}, [parseHash])

	// Sync with browser back/forward navigation
	useEffect(() => {
		const onHashChange = () => {
			const parsed = parseHash()
			if (!parsed) {
				setActiveComponent(null)
				return
			}
			setActiveComponent(parsed.component)
		}
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [parseHash])

	return { activeComponent, selectStory }
}
