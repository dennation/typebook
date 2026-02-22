import { define } from '../../../../define.js'
import { Conditional } from '../components/WithConditionalTypes'

const comp = define(Conditional, {
	defaults: { sizeLabel: 'size-sm', color: 0 as any, extracted: 'a', excluded: 'a' },
	props: ['sizeLabel', 'color', 'extracted', 'excluded'],
})

export default comp
