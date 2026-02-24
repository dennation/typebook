import { define } from '@dennation/ui-studio'
import { Checkbox } from '@heroui/checkbox'

const checkbox = define(Checkbox, {
	defaults: {
		children: 'Agree to terms',
	},
	props: ['size', 'color', 'radius', 'disabled', 'isSelected'],
})

export const Default = checkbox.single({ props: { size: 'md', color: 'primary' } })

export const Sizes = checkbox.variants({ items: checkbox.allOf('size') })

export const Colors = checkbox.variants({ items: checkbox.allOf('color'), columns: 3 })

export const States = checkbox.variants({
	items: checkbox.values('isSelected', [false, true]),
	props: { color: 'primary' },
})

export const Matrix = checkbox.matrix({
	x: checkbox.allOf('color'),
	y: [checkbox.allOf('size')],
})

export default checkbox
