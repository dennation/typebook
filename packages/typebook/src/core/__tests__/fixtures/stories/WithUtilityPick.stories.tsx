import { register } from '../../../../register.js'
import { PickedComponent } from '../components/WithUtilityTypes'

export const comp = register('with-utility-pick', PickedComponent, {
	defaultProps: { a: 'hello' },
	props: ['a', 'd'],
})

