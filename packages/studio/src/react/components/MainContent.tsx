import type { ComponentType } from 'react'
import type { ComponentEntry, Story, PropInfo } from '../../types.js'
import { entryName } from '../utils/naming.js'
import { StoryRenderer } from './StoryRenderer.js'

export interface MainContentProps {
	activeEntry: ComponentEntry | undefined
	storyName: string | null
	story: Story | null
	storyProps: PropInfo[]
	PageContent: ComponentType | null
}

export function MainContent({
	activeEntry,
	storyName,
	story,
	storyProps,
	PageContent,
}: MainContentProps) {
	return (
		<main className="st:overflow-auto st:p-8 st:bg-bg">
			{PageContent ? (
				<PageContent />
			) : activeEntry && storyName && story ? (
				<div>
					<h1 className="st:text-2xl st:font-semibold st:mb-6">
						{entryName(activeEntry)}
					</h1>

					<div className="st:mb-8">
						<h2 className="st:text-lg st:font-medium st:mb-5 st:text-text-muted">
							{story.name ?? storyName}
						</h2>
						<StoryRenderer story={story} props={storyProps} />
					</div>
				</div>
			) : (
				<div className="st:flex st:items-center st:justify-center st:h-full st:text-text-muted st:text-sm">
					Select a component
				</div>
			)}
		</main>
	)
}
