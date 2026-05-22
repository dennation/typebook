import { registerComponent } from '@dennation/typebook'
import { OmittedComponent } from '../components/WithUtilityTypes'

export const comp = registerComponent('with-utility-omit', OmittedComponent, {
	defaultProps: { a: 'hello' },
	include: ['a', 'b', 'd'],
})

