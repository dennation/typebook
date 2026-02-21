import { define } from '@dennation/ui-studio'
import { Switch } from '@heroui/switch'

const switchComponent = define(Switch, {
	path: 'Hero UI',
	defaults: {
		children: 'Enable notifications',
	},
	props: ['size', 'color', 'disabled', 'isSelected'],
})

export const Default = switchComponent.single({
	props: { size: 'md', color: 'primary' }
})

export const Sizes = switchComponent.variants({
	items: switchComponent.allOf('size')
})

export const Colors = switchComponent.variants({
	items: switchComponent.allOf('color'),
	columns: 3
})

export const States = switchComponent.variants({
	items: switchComponent.values('isSelected', [false, true]),
	props: { color: 'success' },
})

export const Matrix = switchComponent.matrix({
	x: switchComponent.allOf('color'),
	y: [switchComponent.allOf('size')],
})

export default switchComponent
