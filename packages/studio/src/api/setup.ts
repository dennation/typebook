import type { ComponentType } from 'react'
import type {
  SetupConfig,
  SetupResult,
  VariantsOptions,
  PreviewExport,
  PreviewVariant,
  Layout,
  Theme,
  PropInfo,
} from '../types.js'
import { DEFAULT_LAYOUT, DEFAULT_THEME } from '../types.js'

/**
 * Internal registry populated at runtime by the dev server
 * with type info extracted via tsgo LSP.
 */
const propRegistry = new Map<ComponentType<any>, PropInfo[]>()

export function __registerProps(
  component: ComponentType<any>,
  props: PropInfo[],
): void {
  propRegistry.set(component, props)
}

export function __getProps(
  component: ComponentType<any>,
): PropInfo[] | undefined {
  return propRegistry.get(component)
}

function generateVariants(
  propInfo: PropInfo,
  defaults: Record<string, unknown>,
  extraProps?: Record<string, unknown>,
): PreviewVariant[] {
  const base = { ...defaults, ...extraProps }

  switch (propInfo.type.kind) {
    case 'literal':
      return propInfo.type.values.map((value) => ({
        label: value,
        props: { ...base, [propInfo.name]: value },
      }))
    case 'boolean':
      return [
        { label: 'true', props: { ...base, [propInfo.name]: true } },
        { label: 'false', props: { ...base, [propInfo.name]: false } },
      ]
    default:
      return [{ label: propInfo.name, props: base }]
  }
}

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
        component,
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

      // Try to get type info from registry
      const registeredProps = propRegistry.get(component)
      const propInfo = registeredProps?.find((p) => p.name === propName)

      let variants: PreviewVariant[]
      if (propInfo) {
        variants = generateVariants(propInfo, defaults, extraProps)
      } else {
        // Fallback: single variant with defaults
        variants = [
          {
            label: propName,
            props: { ...defaults, ...extraProps },
          },
        ]
      }

      return {
        __type: 'preview',
        component,
        variants,
        layout,
        theme,
      }
    },
  }
}
