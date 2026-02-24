import { definePage } from '@dennation/ui-studio'
import Content from './getting-started.md'
import { Button } from '../components/Button'

export default definePage({
	name: 'Getting Started',
	path: 'Guides',
	order: 1,
	content: () => (
		<div style={{ maxWidth: 640, lineHeight: 1.6 }}>
			<Content />
			<h2>Live demo</h2>
			<div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
				<Button size="sm">Small</Button>
				<Button size="md">Medium</Button>
				<Button size="lg">Large</Button>
			</div>
		</div>
	),
})
