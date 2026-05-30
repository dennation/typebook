import { registerComponent } from '@dennation/typebook'
import { ExtendedButton } from '../components/WithInheritance'

export const comp = registerComponent('with-inheritance-extends', ExtendedButton, {
	defaultProps: { id: 'btn-1' },
	pick: ['id', 'className', 'variant', 'disabled'],
})

