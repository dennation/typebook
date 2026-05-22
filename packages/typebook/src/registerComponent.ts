import type { ComponentType } from 'react'
import type { Registration } from './types.js'

type Expand<T> = { [K in keyof T]: T[K] } & {}

export function registerComponent<
  Props extends Record<string, any>,
  IncludedProps extends keyof Props = keyof Props,
  D extends Partial<Props> = Record<PropertyKey, never>,
>(
  id: string,
  component: ComponentType<Props>,
  config?: { defaultProps?: D; include?: ReadonlyArray<IncludedProps> },
): Registration<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> {
  return {
    id,
    component,
    defaultProps: (config?.defaultProps ?? {}) as Record<string, unknown>,
  }
}
