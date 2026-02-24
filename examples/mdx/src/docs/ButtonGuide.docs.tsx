import { definePage } from '@dennation/ui-studio'
import { Story } from '@dennation/ui-studio/react'
import Content from './button-guide.md'
import { Default, Sizes, Variants, Colors, Disabled } from '../stories/Button.stories'

export default definePage({
	name: 'Button',
	path: 'Components',
	order: 1,
	content: () => (
		<div style={{ maxWidth: 720, lineHeight: 1.6 }}>
			<Content />
			<h2>Default</h2>
			<Story of={Default} />
			<h2>Sizes</h2>
			<Story of={Sizes} />
			<h2>Variants</h2>
			<Story of={Variants} />
			<h2>Colors</h2>
			<Story of={Colors} />
			<h2>Disabled state</h2>
			<Story of={Disabled} />
		</div>
	),
})
