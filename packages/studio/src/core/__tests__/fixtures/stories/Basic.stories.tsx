import { define } from '../../../../define.js'
import { Basic } from '../components/Basic'

const basic = define(Basic, {
	defaults: { label: 'Hello' },
	props: ['size', 'variant', 'disabled', 'label', 'count'],
})

export default basic
