import { registerComponent } from '@dennation/typebook'
import { WithChildren } from '../components/WithChildren'

export const comp = registerComponent('with-children', WithChildren, {
	defaultProps: { children: 'Hello' },
	pick: ['children', 'icon', 'onClick', 'renderFooter'],
})

