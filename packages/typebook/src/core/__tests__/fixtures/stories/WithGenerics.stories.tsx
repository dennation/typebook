import { registerComponent } from '@dennation/typebook'
import { Select } from '../components/WithGenerics'

export const select = registerComponent('with-generics', Select<'alpha' | 'beta' | 'gamma'>, {
	defaultProps: { value: 'alpha', options: ['alpha', 'beta', 'gamma'], onChange: () => {} },
	include: ['value', 'options', 'onChange', 'placeholder'],
})

