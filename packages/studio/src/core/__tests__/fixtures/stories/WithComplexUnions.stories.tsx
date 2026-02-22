import { define } from '../../../../define.js'
import { ComplexUnion } from '../components/WithComplexUnions'

const comp = define(ComplexUnion, {
	defaults: { mixed: 'hello', numLiteral: 1, singleLiteral: 'only', boolOrString: true, wide: 'a' },
	props: ['mixed', 'numLiteral', 'singleLiteral', 'boolOrString', 'wide'],
})

export default comp
