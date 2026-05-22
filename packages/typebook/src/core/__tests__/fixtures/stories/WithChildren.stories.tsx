import { register } from '../../../../register.js'
import { WithChildren } from '../components/WithChildren'

export const comp = register('with-children', WithChildren, {
	defaultProps: { children: 'Hello' },
	props: ['children', 'icon', 'onClick', 'renderFooter'],
})

