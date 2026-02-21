import { useState, useCallback, useEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { RegistryEntry, PropInfo } from '../../types.js'
import { STYLE_ELEMENT_ID, DOCS_PAGE } from '../../constants.js'
import { buildSidebarTree, type SidebarNode, type ComponentNode } from '../utils/groupByPath.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../utils/useHashRoute.js'
import { StoryRenderer } from './StoryRenderer.js'
import { ComponentPreview } from './ComponentPreview.js'
import styles from '../styles/styles.css?inline'

export { toKebabCase } from '../utils/naming.js'

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

	// Find active entry
	const activeEntry = registry.find((e) => entryName(e) === activeComponent)

	const isDocsPage = activeStory === DOCS_PAGE

	// Filter components by search query
	const filtered = searchQuery
		? registry.filter((e) => {
				const q = searchQuery.toLowerCase()
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
		: registry

	// Build sidebar tree from paths
	const tree = buildSidebarTree(filtered)

	const toggleCollapse = (key: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}

	const isNodeCollapsed = (key: string) => !searchQuery && collapsed.has(key)

	const renderStoryItem = (storyKey: string, label: string, componentName: string, depth: number) => {
		const isActive = activeComponent === componentName && activeStory === storyKey
		return (
			<button
				key={storyKey}
				className={`st:block st:w-full st:py-1.5 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${
					isActive ? 'st:bg-accent-light st:text-accent st:font-semibold' : ''
				}`}
				style={{ paddingLeft: `${depth * 12 + 8}px` }}
				onClick={() => selectStory(componentName, storyKey)}
				type="button"
			>
				{label}
			</button>
		)
	}

	const renderComponentNode = (comp: ComponentNode, depth: number, parentPath: string) => {
		const compKey = parentPath ? `${parentPath}/${comp.name}` : comp.name
		const compCollapsed = isNodeCollapsed(compKey)
		const isActiveComp = activeComponent === comp.name

		return (
			<div key={comp.name}>
				<button
					className={`st:flex st:items-center st:justify-between st:w-full st:py-1.5 st:pr-3 st:text-sm st:border-none st:bg-transparent st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${
						isActiveComp ? 'st:text-accent st:font-semibold' : 'st:text-text'
					}`}
					style={{ paddingLeft: `${depth * 12 + 8}px` }}
					onClick={() => {
						toggleCollapse(compKey)
						if (compCollapsed && activeComponent !== comp.name) {
							selectStory(comp.name, DOCS_PAGE)
						}
					}}
					type="button"
				>
					<span>{comp.entry.config.name ?? comp.name}</span>
					<span className="st:text-[10px] st:leading-none st:text-text-muted">
						{compCollapsed ? '\u25B8' : '\u25BE'}
					</span>
				</button>
				{!compCollapsed && (
					<>
						{/* Docs page — always first */}
						{renderStoryItem(DOCS_PAGE, DOCS_PAGE, comp.name, depth + 1)}
						{comp.groups.map((group) => {
							const groupKey = `${compKey}/${group.label}`
							const groupCollapsed = isNodeCollapsed(groupKey)
							return (
								<div key={group.label}>
									<button
										className="st:flex st:items-center st:justify-between st:w-full st:py-1.5 st:pr-3 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover"
										style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
										onClick={() => toggleCollapse(groupKey)}
										type="button"
									>
										<span>{group.label}</span>
										<span className="st:text-[10px] st:leading-none st:text-text-muted">
											{groupCollapsed ? '\u25B8' : '\u25BE'}
										</span>
									</button>
									{!groupCollapsed &&
										group.stories.map((s) => {
											const story = comp.entry.stories[s.name]
											return renderStoryItem(s.name, story?.name ?? s.name, s.componentName, depth + 2)
										})}
								</div>
							)
						})}
					</>
				)}
			</div>
		)
	}

	const renderTree = (nodes: SidebarNode[], depth: number = 0, parentPath: string = '') =>
		nodes.map((node) => {
			if (!node.label) {
				return node.components.map((comp) => renderComponentNode(comp, depth, parentPath))
			}

			const nodeKey = parentPath ? `${parentPath}/${node.label}` : node.label
			const hasChildren = node.children.length > 0 || node.components.length > 0
			const nodeCollapsed = isNodeCollapsed(nodeKey)

			return (
				<div key={node.label}>
					<button
						className="st:flex st:items-center st:justify-between st:w-full st:pt-3 st:pb-1 st:pr-3 st:text-xs st:font-semibold st:uppercase st:tracking-wide st:text-text-muted st:bg-transparent st:border-none st:cursor-pointer st:text-left hover:st:text-text"
						style={{ paddingLeft: `${(depth + 1) * 12}px` }}
						onClick={() => hasChildren && toggleCollapse(nodeKey)}
						type="button"
					>
						<span>{node.label}</span>
						{hasChildren && (
							<span className="st:text-[10px] st:leading-none">
								{nodeCollapsed ? '\u25B8' : '\u25BE'}
							</span>
						)}
					</button>
					{!nodeCollapsed && (
						<>
							{node.components.map((comp) =>
								renderComponentNode(comp, depth + 1, nodeKey),
							)}
							{renderTree(node.children, depth + 1, nodeKey)}
						</>
					)}
				</div>
			)
		})

	// Active story data (only for non-docs pages)
	const activeStoryObj =
		activeEntry && activeStory && !isDocsPage ? activeEntry.stories[activeStory] : null
	const storyProps = activeStoryObj
		? activeStoryObj.component === activeEntry!.config.component
			? (activeEntry!.meta?.props ?? [])
			: (propsMap.get(activeStoryObj.component) ?? [])
		: []

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

			{/* Sidebar */}
			<nav className="st:bg-bg-sidebar st:border-r st:border-border st:overflow-y-auto st:py-2">
				{!disableSearch && (
					<div className="st:px-3 st:pb-2">
						<input
							type="text"
							placeholder="Search…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="st:w-full st:px-2.5 st:py-1.5 st:text-sm st:rounded-md st:border st:border-border st:bg-bg st:text-text st:outline-none st:placeholder-text-muted focus:st:border-accent"
						/>
					</div>
				)}
				{renderTree(tree)}
			</nav>

			{/* Main content */}
			<main className="st:overflow-auto st:p-6 st:bg-bg">
				{activeEntry && activeStory ? (
					<div>
						<h1 className="st:text-2xl st:font-bold st:mb-4">
							{entryName(activeEntry)}
						</h1>

						{isDocsPage ? (
							<ComponentPreview
								component={activeEntry.config.component}
								defaults={activeEntry.config.defaults}
								props={activeEntry.meta?.props ?? []}
							/>
						) : activeStoryObj ? (
							<div className="st:mb-8">
								<h2 className="st:text-xl st:font-semibold st:mb-4">
									{activeStoryObj.name ?? activeStory}
								</h2>
								<div className="st:bg-checkered st:rounded-lg st:border st:border-border st:p-6">
									<StoryRenderer story={activeStoryObj} props={storyProps} />
								</div>
							</div>
						) : null}
					</div>
				) : (
					<div className="st:flex st:items-center st:justify-center st:h-full st:text-text-muted st:text-sm">
						Select a component
					</div>
				)}
			</main>
		</div>
	)
}
