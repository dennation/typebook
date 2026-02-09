import { useState, useCallback, useEffect } from 'react'
import type { ResolvedComponent } from '../../types.js'
import { PACKAGE_NAME } from '../../constants.js'
import { groupComponents } from '../utils/groupComponents.js'
import { StoryRenderer } from './StoryRenderer.js'
import styles from '../styles/styles.generated.css?inline'

export interface StudioProps {
	registry: ResolvedComponent[]
	theme?: 'light' | 'dark'
}

export function Studio({ registry, theme: initialTheme = 'light' }: StudioProps) {
	const [activeComponent, setActiveComponent] = useState<string | null>(null)
	const [activeStory, setActiveStory] = useState<string | null>(null)
	const [theme, setTheme] = useState(initialTheme)

	const selectStory = useCallback((componentName: string, storyName: string) => {
		setActiveComponent(componentName)
		setActiveStory(storyName)
	}, [])

	const toggleTheme = useCallback(() => {
		setTheme((t) => (t === 'light' ? 'dark' : 'light'))
	}, [])

	// Find active data
	const comp = registry.find((c) => c.name === activeComponent)
	const story = comp?.stories.find((s) => s.name === activeStory)

	// Group components by group
	const grouped = groupComponents(registry)

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
				{grouped.map(({ group, components }) => (
					<div key={group ?? '__ungrouped'}>
						{group && (
							<div className="st:px-4 st:pt-3 st:pb-1 st:text-xs st:font-semibold st:uppercase st:tracking-wide st:text-text-muted">
								{group}
							</div>
						)}
						{components.map((c) => (
							<div key={c.name}>
								<div className="st:px-4 st:py-1.5 st:text-sm st:font-semibold st:text-text-muted">
									{c.title ?? c.name}
								</div>
								{c.stories.map((s) => (
									<button
										key={s.name}
										className={`st:block st:w-full st:py-1.5 st:pl-7 st:pr-4 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${activeComponent === c.name && activeStory === s.name
											? 'st:bg-accent-light st:text-accent'
											: ''
											}`}
										onClick={() => selectStory(c.name, s.name)}
										type="button"
									>
										{s.name}
									</button>
								))}
							</div>
						))}
					</div>
				))}
			</nav>

			{/* Main content */}
			<main className="st:overflow-auto st:p-6">
				{comp && story ? (
					<>
						<div className="st:text-sm st:text-text-muted st:mb-4">
							{comp.title ?? comp.name} / {story.name}
						</div>
						<StoryRenderer story={story} component={comp.component} />
					</>
				) : (
					<div className="st:flex st:items-center st:justify-center st:h-full st:text-text-muted st:text-sm">
						Select a story
					</div>
				)}
			</main>
		</div>
	)
}
