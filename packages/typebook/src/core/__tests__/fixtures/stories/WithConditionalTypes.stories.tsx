import { register } from '../../../../register.js'
import { Conditional } from '../components/WithConditionalTypes'

export const comp = register('with-conditional-types', Conditional, {
	defaultProps: { sizeLabel: 'size-sm', color: 0 as any, extracted: 'a', excluded: 'a' },
	props: ['sizeLabel', 'color', 'extracted', 'excluded'],
})

