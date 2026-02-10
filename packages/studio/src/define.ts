import type { ComponentType } from 'react'
import type {
  Expand,
  DefineConfig,
  DefineResult,
  StoryConfig,
  Story,
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

    story(storyConfig: StoryConfig<Expand<Props>>): Story {
      if (storyConfig.variants) {
        // Variant story
        return {
          __type: 'story',
          kind: 'variants',
          component,
          variants: storyConfig.variants,
          props: storyConfig.props
            ? { ...storyConfig.props }
            : undefined,
        }
      }

      // Static story
      return {
        __type: 'story',
        kind: 'static',
        component,
        props: storyConfig.props
          ? { ...storyConfig.props }
          : undefined,
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
