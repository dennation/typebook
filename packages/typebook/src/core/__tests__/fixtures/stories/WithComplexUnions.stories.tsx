import { register } from '../../../../register.js'
import { ComplexUnion } from '../components/WithComplexUnions'

export const comp = register('with-complex-unions', ComplexUnion, {
	defaultProps: { mixed: 'hello', numLiteral: 1, singleLiteral: 'only', boolOrString: true, wide: 'a' },
	props: ['mixed', 'numLiteral', 'singleLiteral', 'boolOrString', 'wide'],
})

