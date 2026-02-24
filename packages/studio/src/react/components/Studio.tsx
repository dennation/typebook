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

	const { activeView, selectStory, selectPage, selectComponentPage } =
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

	// Filter components and pages by search query
	const { filtered, filteredPages } = useMemo(() => {
		if (!searchQuery) return { filtered: components, filteredPages: topLevelPages }
		const q = searchQuery.toLowerCase()
		const filtered = components.filter((e) => {
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
		const filteredPages = topLevelPages.filter(
			(p) => p.name.toLowerCase().includes(q) || (p.path?.toLowerCase().includes(q) ?? false),
		)
		return { filtered, filteredPages }
	}, [components, topLevelPages, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(
		() => buildSidebarTree(filtered, filteredPages, componentPages),
		[filtered, filteredPages, componentPages],
	)

	// Derive active component name from activeView
	const activeComponentName = activeView && 'component' in activeView ? activeView.component : null

	// Find active entry
	const activeEntry = useMemo(
		() => components.find((e) => entryName(e) === activeComponentName),
		[components, activeComponentName],
	)

	// Active story data
	const activeStoryName = activeView?.type === 'story' ? activeView.story : null

	const story = useMemo(
		() => (activeEntry && activeStoryName ? (activeEntry.stories[activeStoryName] ?? null) : null),
		[activeEntry, activeStoryName],
	)

	const storyProps = useMemo(() => {
		if (!story || !activeEntry) return []
		return story.component === activeEntry.config.component
			? (activeEntry.meta?.props ?? [])
			: (propsMap.get(story.component) ?? [])
	}, [story, activeEntry, propsMap])

	// Find active page content — either top-level page or component page
	const activePageContent = useMemo((): ComponentType | null => {
		if (activeView?.type === 'componentPage' && activeEntry) {
			const entryPages = componentPages.get(activeEntry)
			const page = entryPages?.find((p) => p.name === activeView.page)
			return page?.content ?? null
		}
		if (activeView?.type === 'page') {
			const page = topLevelPages.find((p) => p.name === activeView.name)
			return page?.content ?? null
		}
		return null
	}, [activeView, activeEntry, topLevelPages, componentPages])

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
					activeView={activeView}
					selectStory={selectStory}
					selectPage={selectPage}
					selectComponentPage={selectComponentPage}
					collapsed={collapsed}
					toggleCollapse={toggleCollapse}
					disableSearch={disableSearch}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					theme={theme}
					onToggleTheme={toggleTheme}
				/>

				<MainContent
					activeEntry={activeEntry}
					storyName={activeStoryName}
					story={story}
					storyProps={storyProps}
					activePageContent={activePageContent}
				/>
			</div>
		</StudioMetaProvider>
	)
}
