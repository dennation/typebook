import { register } from '../../../../register.js'
import { PartialComponent } from '../components/WithUtilityTypes'

export const comp = register('with-utility-partial', PartialComponent, {
	props: ['a', 'b', 'c', 'd'],
})

