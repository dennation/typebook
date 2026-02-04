import type { Size, Variant, BaseProps, InteractiveProps } from './types'

interface ComposedButtonProps extends BaseProps, InteractiveProps {
  size: Size
  variant: Variant
}

export function ComposedButton(props: ComposedButtonProps) {
  return <button>{props.children}</button>
}
