import type { ComponentType } from 'react'
import type { ComponentEntry, Story, PropInfo } from '../../types.js'
import { entryName } from '../utils/naming.js'
import { StoryRenderer } from './StoryRenderer.js'

export interface MainContentProps {
	activeEntry: ComponentEntry | undefined
	activeStory: string | null
	activeStoryObj: Story | null
	storyProps: PropInfo[]
	activePageContent: ComponentType | null
}

export function MainContent({
	activeEntry,
	activeStory,
	activeStoryObj,
	storyProps,
	activePageContent,
}: MainContentProps) {
	// Page rendering (top-level pages and component pages like auto-generated Docs)
	if (activePageContent) {
		const PageContent = activePageContent
		return (
			<main className="st:overflow-auto st:p-8 st:bg-bg">
				<PageContent />
			</main>
		)
	}

	return (
		<main className="st:overflow-auto st:p-8 st:bg-bg">
			{activeEntry && activeStory && activeStoryObj ? (
				<div>
					<h1 className="st:text-2xl st:font-semibold st:mb-6">
						{entryName(activeEntry)}
					</h1>

					<div className="st:mb-8">
						<h2 className="st:text-lg st:font-medium st:mb-5 st:text-text-muted">
							{activeStoryObj.name ?? activeStory}
						</h2>
						<StoryRenderer story={activeStoryObj} props={storyProps} />
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
