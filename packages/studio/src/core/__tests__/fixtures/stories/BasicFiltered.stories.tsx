import { define } from '../../../../define.js'
import { Basic } from '../components/Basic'

const basic = define(Basic, {
	defaults: { label: 'Hello' },
	props: ['size', 'disabled'],
})

export default basic
