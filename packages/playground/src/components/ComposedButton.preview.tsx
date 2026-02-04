import { setup } from '@dennation/studio'
import { ComposedButton } from './ComposedButton'

export const composedButton = setup(ComposedButton, {
  defaults: {
    children: 'Click me',
    onClick: () => {},
  },
})

export const Sizes = composedButton.showVariants('size')
export const Variants = composedButton.showVariants('variant')
