import { register } from '../../../../register.js'
import { IntersectionLink } from '../components/WithInheritance'

export const comp = register('with-inheritance-intersection', IntersectionLink, {
	defaultProps: { id: 'link-1', href: '/' },
	props: ['id', 'className', 'href', 'target'],
})

