import { createElement, type ComponentType } from 'react'
import type {
  Expand,
  DefineConfig,
  DefineResult,
  SingleStory,
  VariantsStory,
  MatrixStory,
  Story,
  StoryRenderFn,
  AllOfConfig,
  ValuesConfig,
  GenerateConfig,
  VariantConfig,
} from './types.js'

export function define<
  Props extends Record<string, any>,
  IncludedProps extends keyof Props = keyof Props,
  D extends Partial<Props> = Partial<Props>
>(
  component: ComponentType<Props>,
  config?: DefineConfig<Props, IncludedProps> & { defaults?: D },
): DefineResult<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> {
  const defaults: Record<string, unknown> = config?.defaults ?? {}
  const name = config?.name
  const path = config?.path
  const wrapper = config?.wrapper
  const autoDocs = config?.autoDocs
  const trackActions = config?.trackActions

  const defaultRender: StoryRenderFn = (props) => createElement(component, props)

  const wrapRender = (renderFn: StoryRenderFn): StoryRenderFn => {
    if (!wrapper) return renderFn
    return (props) => wrapper(() => renderFn(props) as any)
  }

  function createStory<T extends Record<string, unknown>>(
    kind: Story['kind'],
    storyConfig: { props?: any; isolate?: boolean; name?: string; path?: string; hidden?: boolean },
    renderFn: StoryRenderFn,
    extra: T,
  ) {
    return {
      __type: 'story' as const,
      kind,
      component,
      defaults,
      props: storyConfig.props ? { ...storyConfig.props } : undefined,
      render: wrapRender(renderFn),
      isolate: storyConfig.isolate,
      name: storyConfig.name,
      path: storyConfig.path,
      hidden: storyConfig.hidden,
      trackActions,
      ...extra,
    }
  }

  const result: DefineResult<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> = {
    __type: 'define',
    component,
    name,
    path,
    defaults,
    autoDocs,
    trackActions,

    single(config?: { props?: any; render?: any; isolate?: boolean; name?: string; path?: string; hidden?: boolean }): SingleStory {
      return createStory('single', config ?? {}, config?.render ?? defaultRender, {}) as SingleStory
    },

    variants(config: {
      items: VariantConfig
      props?: any
      columns?: number
      isolate?: boolean
      name?: string
      path?: string
      hidden?: boolean
    }): VariantsStory {
      return createStory('variants', config, defaultRender, {
        items: config.items,
        columns: config.columns,
      }) as VariantsStory
    },

    matrix(config: {
      x: VariantConfig
      y: VariantConfig[]
      props?: any
      isolate?: boolean
      name?: string
      path?: string
      hidden?: boolean
    }): MatrixStory {
      return createStory('matrix', config, defaultRender, {
        x: config.x,
        y: config.y,
      }) as MatrixStory
    },

    allOf(prop: any): AllOfConfig {
      return { __type: 'allOf', prop: String(prop) }
    },

    values(prop: any, values: any[]): ValuesConfig {
      return { __type: 'values', prop: String(prop), values }
    },

    generate(prop: any, fn: () => any, count: number): GenerateConfig {
      return { __type: 'generate', prop: String(prop), fn, count }
    },
  }

  return result
}
