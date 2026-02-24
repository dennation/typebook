import { definePage } from '@dennation/ui-studio'
import Content from './changelog.md'

export default definePage({
	name: 'Changelog',
	order: 99,
	content: () => (
		<div style={{ maxWidth: 720, lineHeight: 1.6 }}>
			<Content />
		</div>
	),
})
