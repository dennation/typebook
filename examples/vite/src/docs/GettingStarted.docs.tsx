import { definePage } from '@dennation/ui-studio'

export default definePage({
	name: 'Getting Started',
	path: 'Guides',
	content: () => (
		<div style={{ maxWidth: 640, lineHeight: 1.6 }}>
			<h1>Getting Started</h1>
			<p>
				Welcome to the UI Studio example project. This demonstrates how to use
				<code> @dennation/ui-studio </code> with HeroUI components.
			</p>
			<h2>Quick Start</h2>
			<ol>
				<li>Browse components in the sidebar</li>
				<li>Click a component to see its Docs page with interactive controls</li>
				<li>Explore variant and matrix stories for each component</li>
			</ol>
		</div>
	),
})
