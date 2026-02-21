import { define } from '@dennation/ui-studio'
import { Input } from '@heroui/input'

const input = define(Input, {
	defaults: {
		placeholder: 'Enter text',
	},
	props: ['size', 'variant', 'color', 'radius', 'disabled', 'isReadOnly', 'isRequired'],
})

export const Default = input.single({ props: { size: 'md', variant: 'flat' } })

export const Sizes = input.variants({ items: input.allOf('size') })

export const Variants = input.variants({ items: input.allOf('variant') })

export const Colors = input.variants({ items: input.allOf('color'), columns: 3 })

export const States = input.variants({
	items: input.values('disabled', [false, true]),
})

export const Matrix = input.matrix({
	x: input.allOf('size'),
	y: [input.allOf('variant')],
})

export default input
