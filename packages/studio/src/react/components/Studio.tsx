import { useState, useCallback, useEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { RegistryEntry, PropInfo } from '../../types.js'
import { STYLE_ELEMENT_ID, DOCS_PAGE } from '../../constants.js'
import { buildSidebarTree } from '../utils/groupByPath.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../utils/useHashRoute.js'
import { Sidebar } from './Sidebar.js'
import { MainContent } from './MainContent.js'
import styles from '../styles/styles.css?inline'

export interface StudioProps {
	registry: RegistryEntry[]
	theme?: 'light' | 'dark'
	disableSearch?: boolean
}

export function Studio({ registry, theme: initialTheme = 'light', disableSearch = false }: StudioProps) {
	const { activeComponent, activeStory, selectStory } = useHashRoute(registry)
	const [theme, setTheme] = useState(initialTheme)
	const [searchQuery, setSearchQuery] = useState('')
	const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

	// Component → PropInfo[] map for cross-file story resolution
	const propsMap = useMemo(() => {
		const map = new Map<ComponentType<any>, PropInfo[]>()
		for (const entry of registry) {
			if (entry.meta) {
				map.set(entry.config.component, entry.meta.props)
			}
		}
		return map
	}, [registry])

	const toggleTheme = useCallback(() => {
		setTheme((t) => (t === 'light' ? 'dark' : 'light'))
	}, [])

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
		if (!searchQuery) return registry
		const q = searchQuery.toLowerCase()
		return registry.filter((e) => {
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
	}, [registry, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(() => buildSidebarTree(filtered), [filtered])

	// Stories lookup for sidebar
	const storiesMap = useMemo(() => {
		const map: Record<string, RegistryEntry['stories']> = {}
		for (const entry of registry) {
			map[entryName(entry)] = entry.stories
		}
		return map
	}, [registry])

	// Find active entry
	const activeEntry = useMemo(
		() => registry.find((e) => entryName(e) === activeComponent),
		[registry, activeComponent],
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

	// Inject styles once on mount
	useEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return
		const style = document.createElement('style')
		style.id = STYLE_ELEMENT_ID
		style.textContent = styles
		document.head.appendChild(style)
	}, [])

	return (
		<div
			className="st:grid st:grid-cols-[220px_1fr] st:grid-rows-[48px_1fr] st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text"
			data-theme={theme}
		>
			{/* Header */}
			<header className="st:col-span-full st:flex st:items-center st:justify-between st:px-4 st:border-b st:border-border st:bg-bg">
				<span className="st:text-sm st:font-semibold st:tracking-tight">
					UI Studio
				</span>
				<div className="st:flex st:items-center st:gap-2">
					<button
						className="st:w-8 st:h-8 st:rounded-md st:border st:border-border st:bg-transparent st:text-text st:cursor-pointer st:text-sm st:flex st:items-center st:justify-center st:transition-all hover:st:bg-bg-hover"
						title="Toggle theme"
						onClick={toggleTheme}
						type="button"
					>
						{theme === 'light' ? '\u263C' : '\u263E'}
					</button>
				</div>
			</header>

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
	)
}
