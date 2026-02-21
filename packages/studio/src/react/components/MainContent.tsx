import type { ComponentEntry, Story, PropInfo } from '../../types.js'
import { entryName } from '../utils/naming.js'
import { StoryRenderer } from './StoryRenderer.js'
import { ComponentPreview } from './ComponentPreview.js'

export interface MainContentProps {
	activeEntry: ComponentEntry | undefined
	activeStory: string | null
	isDocsPage: boolean
	activeStoryObj: Story | null
	storyProps: PropInfo[]
}

export function MainContent({
	activeEntry,
	activeStory,
	isDocsPage,
	activeStoryObj,
	storyProps,
}: MainContentProps) {
	return (
		<main className="st:flex-1 st:overflow-auto st:p-6">
			{activeEntry && activeStory ? (
				<div>
					<h1 className="st:text-2xl st:font-bold st:mb-5">
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
							<h2 className="st:text-lg st:font-semibold st:mb-4 st:text-text-muted">
								{activeStoryObj.name ?? activeStory}
							</h2>
							<StoryRenderer story={activeStoryObj} props={storyProps} />
						</div>
					) : null}
				</div>
			) : (
				<div className="st:flex st:items-center st:justify-center st:h-full st:text-text-muted st:text-sm">
					Select a component
				</div>
			)}
		</main>
	)
}
