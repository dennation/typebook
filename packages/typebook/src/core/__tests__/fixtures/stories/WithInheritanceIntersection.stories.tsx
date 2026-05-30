import { registerComponent } from '@dennation/typebook'
import { IntersectionLink } from '../components/WithInheritance'

export const comp = registerComponent('with-inheritance-intersection', IntersectionLink, {
	defaultProps: { id: 'link-1', href: '/' },
	pick: ['id', 'className', 'href', 'target'],
})

