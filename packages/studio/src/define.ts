import { createElement, type ComponentType } from 'react'
import type {
  Expand,
  DefineConfig,
  DefineResult,
  SingleStory,
  VariantsStory,
  MatrixStory,
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
  const title = config?.title
  const path = config?.path
  const wrapper = config?.wrapper

  const defaultRender: StoryRenderFn = (props) => createElement(component, props)

  const wrapRender = (renderFn: StoryRenderFn): StoryRenderFn => {
    if (!wrapper) return renderFn
    return (props) => wrapper(() => renderFn(props) as any)
  }

  const result: DefineResult<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> = {
    __type: 'define',
    component,
    title,
    path,
    defaults,

    // Story creation methods
    single(config?: { props?: any; render?: any; isolate?: boolean }): SingleStory {
      return {
        __type: 'story',
        kind: 'single',
        component,
        defaults,
        props: config?.props ? { ...config.props } : undefined,
        render: wrapRender(config?.render ?? defaultRender),
        isolate: config?.isolate,
      }
    },

    variants(config: {
      items: VariantConfig
      props?: any
      columns?: number
      isolate?: boolean
    }): VariantsStory {
      return {
        __type: 'story',
        kind: 'variants',
        component,
        defaults,
        items: config.items,
        props: config.props ? { ...config.props } : undefined,
        columns: config.columns,
        render: wrapRender(defaultRender),
        isolate: config.isolate,
      }
    },

    matrix(config: {
      x: VariantConfig
      y: VariantConfig[]
      props?: any
      isolate?: boolean
    }): MatrixStory {
      return {
        __type: 'story',
        kind: 'matrix',
        component,
        defaults,
        x: config.x,
        y: config.y,
        props: config.props ? { ...config.props } : undefined,
        render: wrapRender(defaultRender),
        isolate: config.isolate,
      }
    },

    // Variant config helpers
    allOf(prop: any): AllOfConfig {
      return {
        __type: 'allOf',
        prop: String(prop),
      }
    },

    values(prop: any, values: any[]): ValuesConfig {
      return {
        __type: 'values',
        prop: String(prop),
        values,
      }
    },

    generate(prop: any, fn: () => any, count: number): GenerateConfig {
      return {
        __type: 'generate',
        prop: String(prop),
        fn,
        count,
      }
    },
  }

  return result
}
