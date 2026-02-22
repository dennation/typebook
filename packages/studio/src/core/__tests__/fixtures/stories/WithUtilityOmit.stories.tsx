import { define } from '../../../../define.js'
import { OmittedComponent } from '../components/WithUtilityTypes'

const comp = define(OmittedComponent, {
	defaults: { a: 'hello' },
	props: ['a', 'b', 'd'],
})

export default comp
