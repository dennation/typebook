import { define } from '../../../../define.js'
import { Nullable } from '../components/WithNullable'

const comp = define(Nullable, {
	defaults: { value: 'test', data: 0, flag: false },
	props: ['value', 'status', 'data', 'flag'],
})

export default comp
