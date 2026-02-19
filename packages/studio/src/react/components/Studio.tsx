import { useState, useCallback, useEffect } from 'react'
import type { ResolvedComponent } from '../../types.js'
import { PACKAGE_NAME } from '../../constants.js'
import { groupComponents } from '../utils/groupComponents.js'
import { StoryRenderer } from './StoryRenderer.js'
import { ComponentPreview } from './ComponentPreview.js'
import styles from '../styles/styles.css?inline'

export interface StudioProps {
	registry: ResolvedComponent[]
	theme?: 'light' | 'dark'
}

export function toKebabCase(str: string): string {
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

export function Studio({ registry, theme: initialTheme = 'light' }: StudioProps) {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)
	const [theme, setTheme] = useState(initialTheme)
	const [searchQuery, setSearchQuery] = useState('')

	const findByKebab = useCallback(
		(kebabComponent: string, kebabStory: string) => {
			const comp = registry.find((c) => toKebabCase(c.name) === kebabComponent)
			if (!comp) return null
			const story = comp.stories.find((s) => toKebabCase(s.name) === kebabStory)
			if (!story) return null
			return { component: comp.name, story: story.name }
		},
		[registry],
	)

	const parseHash = useCallback((): { component: string; story: string } | null => {
		const hash = window.location.hash.slice(1) // remove #
		if (!hash) return null
		const parts = hash.split('/')
		if (parts.length >= 2) {
			const kebabComp = decodeURIComponent(parts[0])
			const kebabStory = decodeURIComponent(parts[1])
			return findByKebab(kebabComp, kebabStory)
		}
		return null
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

	const toggleTheme = useCallback(() => {
		setTheme((t) => (t === 'light' ? 'dark' : 'light'))
	}, [])

	// Find active component
	const comp = registry.find((c) => c.name === activeComponent)

	// Filter components by search query (matches title, displayName, function name)
	const filtered = searchQuery
		? registry.filter((c) => {
				const q = searchQuery.toLowerCase()
				return [c.title, c.component.displayName, c.component.name, c.group]
					.filter(Boolean)
					.some((s) => s!.toLowerCase().includes(q))
			})
		: registry

	// Group components by group
	const grouped = groupComponents(filtered)

	// Inject styles once on mount
	useEffect(() => {
		const id = 'ui-studio-styles'
		if (document.getElementById(id)) return
		const style = document.createElement('style')
		style.id = id
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
						{components.map((c) => (
							<button
								key={c.name}
								className={`st:block st:w-full st:px-4 st:py-1.5 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${activeComponent === c.name
									? 'st:bg-accent-light st:text-accent st:font-semibold'
									: ''
									}`}
								onClick={() => {
									const firstStory = c.stories[0]
									if (firstStory) selectStory(c.name, firstStory.name)
								}}
								type="button"
							>
								{c.title ?? c.name}
							</button>
						))}
					</div>
				))}
			</nav>

			{/* Main content */}
			<main className="st:overflow-auto st:p-6 st:bg-bg">
				{comp ? (
					<div>
						{/* Component header */}
						<h1 className="st:text-2xl st:font-bold st:mb-4">
							{comp.title ?? comp.name}
						</h1>

						{/* Interactive preview + props */}
						<ComponentPreview comp={comp} />

						{/* Stories */}
						{comp.stories.map((story) => (
							<div key={story.name} className="st:mb-8">
								<h2 className="st:text-xl st:font-semibold st:mb-4">
							{story.name}
							{story.variants?.length && (
								<span className="st:text-text-muted st:font-normal st:ml-2">
									({story.variants.length})
								</span>
							)}
						</h2>
								<div className="st:bg-checkered st:rounded-lg st:border st:border-border st:p-6">
									<StoryRenderer story={story} component={comp.component} />
								</div>
							</div>
						))}
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
