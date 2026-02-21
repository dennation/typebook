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

export default button
