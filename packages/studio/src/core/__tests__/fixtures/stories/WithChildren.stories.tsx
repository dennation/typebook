import { define } from '../../../../define.js'
import { WithChildren } from '../components/WithChildren'

const comp = define(WithChildren, {
	defaults: { children: 'Hello' },
	props: ['children', 'icon', 'onClick', 'renderFooter'],
})

export default comp
