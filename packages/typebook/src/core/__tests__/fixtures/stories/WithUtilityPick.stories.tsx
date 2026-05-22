import { registerComponent } from '@dennation/typebook'
import { PickedComponent } from '../components/WithUtilityTypes'

export const comp = registerComponent('with-utility-pick', PickedComponent, {
	defaultProps: { a: 'hello' },
	include: ['a', 'd'],
})

