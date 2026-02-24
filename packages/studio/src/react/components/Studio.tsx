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
	const { components, pages = [] } = registry
	const { activeComponent, activeStory, activePage, selectStory, selectPage } = useHashRoute(components, pages)
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

	// Filter pages by search query
	const filteredPages = useMemo(() => {
		if (!searchQuery) return pages
		const q = searchQuery.toLowerCase()
		return pages.filter((p) => {
			return p.page.name.toLowerCase().includes(q) || (p.page.path?.toLowerCase().includes(q) ?? false)
		})
	}, [pages, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(() => buildSidebarTree(filtered, filteredPages), [filtered, filteredPages])

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

	// Find active page entry
	const activePageEntry = useMemo(
		() => (activePage ? pages.find((p) => p.name === activePage) : undefined),
		[pages, activePage],
	)

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
			className="st:grid st:grid-cols-[260px_1fr] st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text"
			data-theme={theme}
		>
			<Sidebar
				tree={tree}
				activeComponent={activeComponent}
				activeStory={activeStory}
				activePage={activePage}
				selectStory={selectStory}
				selectPage={selectPage}
				collapsed={collapsed}
				toggleCollapse={toggleCollapse}
				disableSearch={disableSearch}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				stories={storiesMap}
				theme={theme}
				onToggleTheme={toggleTheme}
			/>

			<MainContent
				activeEntry={activeEntry}
				activeStory={activeStory}
				isDocsPage={isDocsPage}
				activeStoryObj={activeStoryObj}
				storyProps={storyProps}
				activePageContent={activePageEntry?.content ?? null}
				activePageName={activePage}
			/>
		</div>
	)
}
