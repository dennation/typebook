import { define } from '@dennation/ui-studio'
import { Button } from '@heroui/button'

const button = define(Button, {
  group: 'Forms',
  defaults: {
    children: 'Click me',
  },
})

export const Sizes = button.story({ variants: button.valuesOf('size') })

export default button
