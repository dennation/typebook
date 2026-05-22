import { registerComponent } from '@dennation/typebook'
import { Basic } from '../components/Basic'

export const basic = registerComponent('basic', Basic, {
	defaultProps: { label: 'Hello' },
	include: ['size', 'variant', 'disabled', 'label', 'count'],
})

