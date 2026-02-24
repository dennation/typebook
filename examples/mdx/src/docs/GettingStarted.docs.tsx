import { definePage } from '@dennation/ui-studio'
import { Story } from '@dennation/ui-studio/react'
import Content from './getting-started.md'
import { Default, Sizes } from '../stories/Button.stories'

export default definePage({
	name: 'Getting Started',
	path: 'Guides',
	order: 1,
	content: () => (
		<div style={{ maxWidth: 640, lineHeight: 1.6 }}>
			<Content />
			<h2>Live demo</h2>
			<Story of={Default} />
			<h2>All sizes</h2>
			<Story of={Sizes} />
		</div>
	),
})
