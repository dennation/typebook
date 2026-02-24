import { definePage } from '@dennation/ui-studio'
import Content from './theming.md'

export default definePage({
	name: 'Theming',
	path: 'Guides',
	order: 2,
	content: () => (
		<div style={{ maxWidth: 720, lineHeight: 1.6 }}>
			<Content />
		</div>
	),
})
