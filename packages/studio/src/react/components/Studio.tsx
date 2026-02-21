import { useState, useCallback, useInsertionEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { Registry, ComponentEntry, PropInfo } from '../../types.js'
import { STYLE_ELEMENT_ID, DOCS_PAGE } from '../../constants.js'
import { buildSidebarTree } from '../utils/buildSidebarTree.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../hooks/useHashRoute.js'
import { useTheme, type Theme } from '../hooks/useTheme.js'
import { Sidebar } from './Sidebar.js'
import { MainContent } from './MainContent.js'
import styles from '../styles/styles.css?inline'

export interface StudioProps {
	registry: Registry
	theme?: Theme
	disableSearch?: boolean
}

export function Studio({ registry, theme: themeOverride, disableSearch = false }: StudioProps) {
	const { components } = registry
	const { activeComponent, activeStory, selectStory } = useHashRoute(components)
	const { theme, toggleTheme } = useTheme(themeOverride)
	const [searchQuery, setSearchQuery] = useState('')
	const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

	// Component → PropInfo[] map for cross-file story resolution
	const propsMap = useMemo(() => {
		const map = new Map<ComponentType<any>, PropInfo[]>()
		for (const entry of components) {
			if (entry.meta) {
				map.set(entry.config.component, entry.meta.props)
			}
		}
		return map
	}, [components])

	const toggleCollapse = useCallback((key: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}, [])

	// Filter components by search query
	const filtered = useMemo(() => {
		if (!searchQuery) return components
		const q = searchQuery.toLowerCase()
		return components.filter((e) => {
			const matchesComponent = [
				e.config.name,
				e.config.component.displayName,
				e.config.component.name,
				e.config.path,
			]
				.filter(Boolean)
				.some((s) => s!.toLowerCase().includes(q))
			const matchesStory = Object.keys(e.stories).some((s) => s.toLowerCase().includes(q))
			return matchesComponent || matchesStory
		})
	}, [components, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(() => buildSidebarTree(filtered), [filtered])

	// Stories lookup for sidebar
	const storiesMap = useMemo(() => {
		const map: Record<string, ComponentEntry['stories']> = {}
		for (const entry of components) {
			map[entryName(entry)] = entry.stories
		}
		return map
	}, [components])

	// Find active entry
	const activeEntry = useMemo(
		() => components.find((e) => entryName(e) === activeComponent),
		[components, activeComponent],
	)

	const isDocsPage = activeStory === DOCS_PAGE

	// Active story data (only for non-docs pages)
	const activeStoryObj = useMemo(
		() => (activeEntry && activeStory && !isDocsPage ? (activeEntry.stories[activeStory] ?? null) : null),
		[activeEntry, activeStory, isDocsPage],
	)

	const storyProps = useMemo(() => {
		if (!activeStoryObj || !activeEntry) return []
		return activeStoryObj.component === activeEntry.config.component
			? (activeEntry.meta?.props ?? [])
			: (propsMap.get(activeStoryObj.component) ?? [])
	}, [activeStoryObj, activeEntry, propsMap])

	// Inject styles before first paint to prevent FOUC
	useInsertionEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return
		const style = document.createElement('style')
		style.id = STYLE_ELEMENT_ID
		style.textContent = styles
		document.head.appendChild(style)
	}, [])

	return (
		<div
			className="st:h-screen st:m-0 st:p-3 st:box-border st:font-sans st:text-text st:bg-gradient-studio st:flex st:flex-col st:gap-3"
			data-theme={theme}
		>
			{/* Header */}
			<header className="st:flex st:items-center st:justify-between st:px-5 st:h-14 st:shrink-0 st:glass st:rounded-2xl">
				<span className="st:text-sm st:font-semibold st:tracking-tight">
					UI Studio
				</span>
				<button
					className="st:w-8 st:h-8 st:rounded-full st:glass-subtle st:text-text st:cursor-pointer st:text-sm st:flex st:items-center st:justify-center st:transition-all hover:st:bg-bg-hover"
					title="Toggle theme"
					onClick={toggleTheme}
					type="button"
				>
					{theme === 'light' ? '\u263C' : '\u263E'}
				</button>
			</header>

			<div className="st:flex st:gap-3 st:flex-1 st:min-h-0">
				<Sidebar
					tree={tree}
					activeComponent={activeComponent}
					activeStory={activeStory}
					selectStory={selectStory}
					collapsed={collapsed}
					toggleCollapse={toggleCollapse}
					disableSearch={disableSearch}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					stories={storiesMap}
				/>

				<MainContent
					activeEntry={activeEntry}
					activeStory={activeStory}
					isDocsPage={isDocsPage}
					activeStoryObj={activeStoryObj}
					storyProps={storyProps}
				/>
			</div>
		</div>
	)
}
