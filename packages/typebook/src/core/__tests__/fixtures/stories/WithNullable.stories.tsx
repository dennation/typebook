import { register } from '../../../../register.js'
import { Nullable } from '../components/WithNullable'

export const comp = register('with-nullable', Nullable, {
	defaultProps: { value: 'test', data: 0, flag: false },
	props: ['value', 'status', 'data', 'flag'],
})

