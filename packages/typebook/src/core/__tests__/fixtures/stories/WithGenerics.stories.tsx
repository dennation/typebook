import { register } from '../../../../register.js'
import { Select } from '../components/WithGenerics'

export const select = register('with-generics', Select<'alpha' | 'beta' | 'gamma'>, {
	defaultProps: { value: 'alpha', options: ['alpha', 'beta', 'gamma'], onChange: () => {} },
	props: ['value', 'options', 'onChange', 'placeholder'],
})

