import type { ComponentType } from 'react'
import type {
  Expand,
  DefineConfig,
  DefineResult,
  StoryConfig,
  StoryExport,
  ValuesOfMarker,
} from './types.js'

export function define<
  Props extends Record<string, any>,
  IncludedProps extends keyof Props = keyof Props
>(
  component: ComponentType<Props>,
  config?: DefineConfig<Props, IncludedProps>,
): DefineResult<Expand<Pick<Props, IncludedProps>>> {
  const defaults: Record<string, unknown> = config?.defaults ?? {}
  const title = config?.title
  const group = config?.group

  const result: DefineResult<Expand<Pick<Props, IncludedProps>>> = {
    __type: 'define',
    component,
    title,
    group,
    defaults,

    story(storyConfig: StoryConfig<Expand<Props>>): StoryExport {
      if (storyConfig.variants) {
        // Variant story
        return {
          __type: 'story',
          kind: 'variants',
          component,
          defaults,
          variants: storyConfig.variants,
          extraProps: storyConfig.props
            ? { ...storyConfig.props }
            : undefined,
        }
      }

      // Static story — merge defaults with provided props
      const merged = { ...defaults, ...storyConfig.props }
      return {
        __type: 'story',
        kind: 'static',
        component,
        defaults,
        props: merged,
      }
    },

    valuesOf(
      prop: keyof Expand<Props>,
      options?: { columns?: number },
    ): ValuesOfMarker {
      return {
        __type: 'valuesOf',
        prop: String(prop),
        columns: options?.columns,
      }
    },
  }

  return result
}
