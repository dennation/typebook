import { register } from '../../../../register.js'
import { Basic } from '../components/Basic'

export const basic = register('basic-filtered', Basic, {
	defaultProps: { label: 'Hello' },
	props: ['size', 'disabled'],
})

