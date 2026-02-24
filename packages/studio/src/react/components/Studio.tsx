import { useState, useCallback, useInsertionEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { Registry, ComponentEntry, PropInfo } from '../../types.js'
import { STYLE_ELEMENT_ID } from '../../constants.js'
import { buildSidebarTree } from '../utils/buildSidebarTree.js'
import { resolveComponentPages } from '../utils/resolveComponentPages.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../hooks/useHashRoute.js'
import { useTheme, type Theme } from '../hooks/useTheme.js'
import { StudioMetaProvider } from '../context.js'
import { Sidebar } from './Sidebar.js'
import { MainContent } from './MainContent.js'
import { Playground } from './Playground.js'
import styles from '../styles/styles.css?inline'

export interface StudioProps {
	registry: Registry
	theme?: Theme
	disableSearch?: boolean
}

export function Studio({ registry, theme: themeOverride, disableSearch = false }: StudioProps) {
	const { components, pages = [] } = registry
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

	// Resolve component pages (auto-generated docs + user overrides)
	const { componentPages, topLevelPages } = useMemo(
		() =>
			resolveComponentPages(components, pages, (entry) => {
				const DocsContent = () => <Playground of={entry.config} />
				DocsContent.displayName = `${entryName(entry)}Docs`
				return DocsContent
			}),
		[components, pages],
	)

	const { activeComponent, activeStory, activePage, activeComponentPage, selectStory, selectPage, selectComponentPage } =
		useHashRoute(components, topLevelPages, componentPages)

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

	// Filter top-level pages by search query
	const filteredPages = useMemo(() => {
		if (!searchQuery) return topLevelPages
		const q = searchQuery.toLowerCase()
		return topLevelPages.filter((p) => {
			return p.name.toLowerCase().includes(q) || (p.path?.toLowerCase().includes(q) ?? false)
		})
	}, [topLevelPages, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(
		() => buildSidebarTree(filtered, filteredPages, componentPages),
		[filtered, filteredPages, componentPages],
	)

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

	// Active story data
	const activeStoryObj = useMemo(
		() => (activeEntry && activeStory ? (activeEntry.stories[activeStory] ?? null) : null),
		[activeEntry, activeStory],
	)

	const storyProps = useMemo(() => {
		if (!activeStoryObj || !activeEntry) return []
		return activeStoryObj.component === activeEntry.config.component
			? (activeEntry.meta?.props ?? [])
			: (propsMap.get(activeStoryObj.component) ?? [])
	}, [activeStoryObj, activeEntry, propsMap])

	// Find active page content — either top-level page or component page
	const activePageContent = useMemo((): ComponentType | null => {
		// Component page (e.g., auto-generated Docs)
		if (activeComponentPage && activeEntry) {
			const entryPages = componentPages.get(activeEntry)
			const page = entryPages?.find((p) => p.name === activeComponentPage)
			return page?.content ?? null
		}
		// Top-level page
		if (activePage) {
			const page = topLevelPages.find((p) => p.name === activePage)
			return page?.content ?? null
		}
		return null
	}, [activeComponentPage, activeEntry, activePage, topLevelPages, componentPages])

	// Inject styles before first paint to prevent FOUC
	useInsertionEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return
		const style = document.createElement('style')
		style.id = STYLE_ELEMENT_ID
		style.textContent = styles
		document.head.appendChild(style)
	}, [])

	return (
		<StudioMetaProvider value={propsMap}>
			<div
				className="st:grid st:grid-cols-[260px_1fr] st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text"
				data-theme={theme}
			>
				<Sidebar
					tree={tree}
					activeComponent={activeComponent}
					activeStory={activeStory}
					activePage={activePage}
					activeComponentPage={activeComponentPage}
					selectStory={selectStory}
					selectPage={selectPage}
					selectComponentPage={selectComponentPage}
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
					activeStoryObj={activeStoryObj}
					storyProps={storyProps}
					activePageContent={activePageContent}
				/>
			</div>
		</StudioMetaProvider>
	)
}
