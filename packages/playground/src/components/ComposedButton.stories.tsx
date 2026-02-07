import { define } from '@dennation/studio'
import { ComposedButton } from './ComposedButton'

const composedButton = define(ComposedButton, {
  group: 'Forms',
  defaults: {
    children: 'Click me',
    onClick: () => {},
  },
})

export const Sizes = composedButton.story({ variants: composedButton.valuesOf('size') })
export const Variants = composedButton.story({ variants: composedButton.valuesOf('variant') })

export default composedButton
