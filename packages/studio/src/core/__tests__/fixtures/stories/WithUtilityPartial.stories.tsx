import { define } from '../../../../define.js'
import { PartialComponent } from '../components/WithUtilityTypes'

const comp = define(PartialComponent, {
	props: ['a', 'b', 'c', 'd'],
})

export default comp
