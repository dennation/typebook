import { define } from '@dennation/ui-studio'
import { Button } from '@heroui/button'

const button = define(Button, {
	path: 'Hero UI',
	defaults: {
		children: 'Click me',
	},
	props: ['size', 'variant', 'color', 'radius', 'disabled', 'isLoading'],
})

export const Default = button.single({ props: { size: 'md', variant: 'solid', color: 'primary' } })

export const Sizes = button.variants({ items: button.allOf('size') })

export const Variants = button.variants({ items: button.allOf('variant') })

export const Colors = button.variants({ items: button.allOf('color'), columns: 3 })

export const Radiuses = button.variants({ items: button.allOf('radius') })

export const Disabled = button.variants({ items: button.allOf('disabled') })

export const Loading = button.variants({ items: button.allOf('isLoading') })

export const Matrix = button.matrix({
	x: button.allOf('color'),
	y: [button.allOf('variant')],
})


export default button