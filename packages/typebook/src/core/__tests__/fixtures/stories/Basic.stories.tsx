import { register } from '../../../../register.js'
import { Basic } from '../components/Basic'

export const basic = register('basic', Basic, {
	defaultProps: { label: 'Hello' },
	props: ['size', 'variant', 'disabled', 'label', 'count'],
})

