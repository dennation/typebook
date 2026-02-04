import type { ComponentType } from 'react'
import type {
  SetupConfig,
  SetupResult,
  VariantsOptions,
  PreviewExport,
  PreviewVariant,
  Layout,
  Theme,
} from '../types.js'
import { DEFAULT_LAYOUT, DEFAULT_THEME } from '../types.js'

export function setup<Props extends Record<string, any>>(
  component: ComponentType<Props>,
  config: SetupConfig<Props>,
): SetupResult<Props> {
  const baseLayout = config.layout ?? DEFAULT_LAYOUT
  const baseTheme = config.theme ?? DEFAULT_THEME
  const defaults = (config.defaults ?? {}) as Record<string, unknown>

  return {
    show(props: Partial<Props>): PreviewExport {
      const merged = { ...defaults, ...props }
      return {
        __type: 'preview',
        kind: 'show',
        component,
        defaults,
        variants: [{ label: 'default', props: merged }],
        layout: baseLayout,
        theme: baseTheme,
      }
    },

    showVariants(
      prop: keyof Props,
      options?: VariantsOptions<Props>,
    ): PreviewExport {
      const layout = options?.layout ?? baseLayout
      const theme = options?.theme ?? baseTheme
      const extraProps = (options?.props ?? {}) as Record<string, unknown>
      const propName = prop as string

      const variants: PreviewVariant[] = [
        {
          label: propName,
          props: { ...defaults, ...extraProps },
        },
      ]

      return {
        __type: 'preview',
        kind: 'showVariants',
        prop: propName,
        component,
        defaults,
        variants,
        layout,
        theme,
      }
    },
  }
}
