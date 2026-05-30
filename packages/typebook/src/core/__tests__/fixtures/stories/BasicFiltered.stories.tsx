import { registerComponent } from '@dennation/typebook'
import { Basic } from '../components/Basic'

export const basic = registerComponent('basic-filtered', Basic, {
	defaultProps: { label: 'Hello' },
	pick: ['size', 'disabled'],
})

