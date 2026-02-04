import { setup } from '@dennation/studio'
import { Button } from './Button'

const button = setup(Button, {
  defaults: {
    children: 'Click me',
    onClick: () => {},
  },
})

export const Sizes = button.showVariants('size')
export const Variants = button.showVariants('variant')
export const WithIcon = button.show({ children: 'Add' })

export default button
