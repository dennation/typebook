import { register } from '../../../../register.js'
import { OmittedComponent } from '../components/WithUtilityTypes'

export const comp = register('with-utility-omit', OmittedComponent, {
	defaultProps: { a: 'hello' },
	props: ['a', 'b', 'd'],
})

