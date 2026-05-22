import { registerComponent } from '@dennation/typebook'
import { PartialComponent } from '../components/WithUtilityTypes'

export const comp = registerComponent('with-utility-partial', PartialComponent, {
	include: ['a', 'b', 'c', 'd'],
})

