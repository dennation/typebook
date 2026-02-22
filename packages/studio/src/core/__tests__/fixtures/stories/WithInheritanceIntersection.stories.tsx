import { define } from '../../../../define.js'
import { IntersectionLink } from '../components/WithInheritance'

const comp = define(IntersectionLink, {
	defaults: { id: 'link-1', href: '/' },
	props: ['id', 'className', 'href', 'target'],
})

export default comp
