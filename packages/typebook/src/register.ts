import type { ComponentType } from 'react'
import type { Expand, RegisterConfig, Registration } from './types.js'

/**
 * Register a component for documentation. Returns a `Registration` carrying
 * the registry id, the component reference, and defaultProps.
 *
 * The `id` is the stable string key under which this component lives in the
 * generated registry. It must be unique across the project.
 *
 * Variant configs are built via the standalone `allOf` / `values` / `generate`
 * utilities (also exported from this package), which take the registration as
 * their first argument for prop-name autocomplete and value typing.
 *
 * The build-time plugin scans for `register(id, Component, ...)` calls and
 * generates a registry object mapping `id → ComponentMeta`.
 */
export function register<
  Props extends Record<string, any>,
  IncludedProps extends keyof Props = keyof Props,
  D extends Partial<Props> = Record<PropertyKey, never>,
>(
  id: string,
  component: ComponentType<Props>,
  config?: Omit<RegisterConfig<Props, IncludedProps>, 'defaultProps'> & { defaultProps?: D },
): Registration<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> {
  return {
    id,
    component,
    defaultProps: (config?.defaultProps ?? {}) as Record<string, unknown>,
  }
}
