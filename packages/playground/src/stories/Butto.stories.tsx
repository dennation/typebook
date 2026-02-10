import { define } from '@dennation/ui-studio'
import { Button } from '@heroui/button'

const button = define(Button, {
	group: 'Forms',
	defaults: {
		children: 'Click me',
	},
	props: ['size', 'variant', 'color', 'radius', 'disabled', 'isLoading'],
})

export const Sizes = button.story({ variants: button.valuesOf('size') })

export const Variants = button.story({ variants: button.valuesOf('variant') })

export const Colors = button.story({ variants: button.valuesOf('color') })

export const Radiuses = button.story({ variants: button.valuesOf('radius') })

export const Disabled = button.story({ variants: button.valuesOf('disabled') })

export const Loading = button.story({ variants: button.valuesOf('isLoading') })


export default button
