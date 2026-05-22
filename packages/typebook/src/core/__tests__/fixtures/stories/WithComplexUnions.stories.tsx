import { registerComponent } from '@dennation/typebook'
import { ComplexUnion } from '../components/WithComplexUnions'

export const comp = registerComponent('with-complex-unions', ComplexUnion, {
	defaultProps: { mixed: 'hello', numLiteral: 1, singleLiteral: 'only', boolOrString: true, wide: 'a' },
	include: ['mixed', 'numLiteral', 'singleLiteral', 'boolOrString', 'wide'],
})

