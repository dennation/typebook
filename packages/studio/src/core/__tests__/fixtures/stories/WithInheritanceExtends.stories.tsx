import { define } from '../../../../define.js'
import { ExtendedButton } from '../components/WithInheritance'

const comp = define(ExtendedButton, {
	defaults: { id: 'btn-1' },
	props: ['id', 'className', 'variant', 'disabled'],
})

export default comp
