import type { Size, Variant, BaseProps, InteractiveProps } from './types'

type InlineButtonProps = BaseProps & InteractiveProps & {
  size: Size
  variant: Variant
}

export function InlineButton(props: InlineButtonProps) {
  return <button>{props.children}</button>
}
