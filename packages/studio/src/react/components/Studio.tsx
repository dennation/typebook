import { useState, useCallback, useEffect, useMemo } from 'react'
import type { ComponentType } from 'react'
import type { RegistryEntry, PropInfo } from '../../types.js'
import { PACKAGE_NAME, STYLE_ELEMENT_ID } from '../../constants.js'
import { groupComponents } from '../utils/groupComponents.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../utils/useHashRoute.js'
import { StoryRenderer } from './StoryRenderer.js'
import { ComponentPreview } from './ComponentPreview.js'
import styles from '../styles/styles.css?inline'

export { toKebabCase } from '../utils/naming.js'

export interface StudioProps {
	registry: RegistryEntry[]
	theme?: 'light' | 'dark'
}

export function Studio({ registry, theme: initialTheme = 'light' }: StudioProps) {
	const { activeComponent, selectStory } = useHashRoute(registry)
	const [theme, setTheme] = useState(initialTheme)
	const [searchQuery, setSearchQuery] = useState('')

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

	// Filter components by search query
	const filtered = searchQuery
		? registry.filter((e) => {
				const q = searchQuery.toLowerCase()
				return [e.config.title, e.config.component.displayName, e.config.component.name, e.config.group]
					.filter(Boolean)
					.some((s) => s!.toLowerCase().includes(q))
			})
		: registry

	// Group components by group
	const grouped = groupComponents(filtered)

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
					{PACKAGE_NAME.charAt(0).toUpperCase() + PACKAGE_NAME.slice(1)}
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
				<div className="st:px-3 st:pb-2">
					<input
						type="text"
						placeholder="Search…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="st:w-full st:px-2.5 st:py-1.5 st:text-sm st:rounded-md st:border st:border-border st:bg-bg st:text-text st:outline-none st:placeholder-text-muted focus:st:border-accent"
					/>
				</div>
				{grouped.map(({ group, components }) => (
					<div key={group ?? '__ungrouped'}>
						{group && (
							<div className="st:px-4 st:pt-3 st:pb-1 st:text-xs st:font-semibold st:uppercase st:tracking-wide st:text-text-muted">
								{group}
							</div>
						)}
						{components.map((entry) => {
							const name = entryName(entry)
							return (
								<button
									key={name}
									className={`st:block st:w-full st:px-4 st:py-1.5 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${activeComponent === name
										? 'st:bg-accent-light st:text-accent st:font-semibold'
										: ''
										}`}
									onClick={() => {
										const firstStory = Object.keys(entry.stories)[0]
										if (firstStory) selectStory(name, firstStory)
									}}
									type="button"
								>
									{entry.config.title ?? name}
								</button>
							)
						})}
					</div>
				))}
			</nav>

			{/* Main content */}
			<main className="st:overflow-auto st:p-6 st:bg-bg">
				{activeEntry ? (
					<div>
						{/* Component header */}
						<h1 className="st:text-2xl st:font-bold st:mb-4">
							{activeEntry.config.title ?? entryName(activeEntry)}
						</h1>

						{/* Interactive preview + props */}
						<ComponentPreview
							component={activeEntry.config.component}
							defaults={activeEntry.config.defaults}
							props={activeEntry.meta?.props ?? []}
						/>

						{/* Stories — resolved lazily per renderer */}
						{Object.entries(activeEntry.stories).map(([name, story]) => {
							// For cross-file stories, look up props by story's component
							const storyProps = story.component === activeEntry.config.component
								? (activeEntry.meta?.props ?? [])
								: (propsMap.get(story.component) ?? [])

							return (
								<div key={name} className="st:mb-8">
									<h2 className="st:text-xl st:font-semibold st:mb-4">{name}</h2>
									<div className="st:bg-checkered st:rounded-lg st:border st:border-border st:p-6">
										<StoryRenderer story={story} props={storyProps} />
									</div>
								</div>
							)
						})}
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
