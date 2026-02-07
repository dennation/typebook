import { define } from '@dennation/studio'
import { Button } from './Button'

const button = define(Button, {
  group: 'Forms',
  defaults: {
    children: 'Click me',
    onClick: () => {},
  },
})

export const Sizes = button.story({ variants: button.valuesOf('size') })
export const Variants = button.story({ variants: button.valuesOf('variant') })
export const WithIcon = button.story({ props: { children: '+ Add', size: 'sm' as const } })

export default button
