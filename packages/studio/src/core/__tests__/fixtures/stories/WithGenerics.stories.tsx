import { define } from '../../../../define.js'
import { Select } from '../components/WithGenerics'

const select = define(Select<'alpha' | 'beta' | 'gamma'>, {
	defaults: { value: 'alpha', options: ['alpha', 'beta', 'gamma'], onChange: () => {} },
	props: ['value', 'options', 'onChange', 'placeholder'],
})

export default select
