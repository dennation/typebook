import { register } from '../../../../register.js'
import { ExtendedButton } from '../components/WithInheritance'

export const comp = register('with-inheritance-extends', ExtendedButton, {
	defaultProps: { id: 'btn-1' },
	props: ['id', 'className', 'variant', 'disabled'],
})

