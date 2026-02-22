import { define } from '../../../../define.js'
import { PickedComponent } from '../components/WithUtilityTypes'

const comp = define(PickedComponent, {
	defaults: { a: 'hello' },
	props: ['a', 'd'],
})

export default comp
