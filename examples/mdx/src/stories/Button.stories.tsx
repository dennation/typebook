import { define } from '@dennation/ui-studio'
import { Button } from '../components/Button'

const button = define(Button, {
	defaults: {
		children: 'Click me',
	},
	props: ['size', 'variant', 'color', 'disabled'],
})

export const Default = button.single({ props: { size: 'md', variant: 'solid', color: 'primary' } })

export const Sizes = button.variants({ items: button.allOf('size') })

export const Variants = button.variants({ items: button.allOf('variant') })

export const Colors = button.variants({ items: button.allOf('color') })

export const Matrix = button.matrix({
	x: button.allOf('color'),
	y: [button.allOf('variant')],
	path: 'Matrix',
})

// Hidden story — only used in documentation pages via <Story of={Disabled} />
export const Disabled = button.variants({
	items: button.values('disabled', [false, true]),
	hidden: true,
})

export default button
