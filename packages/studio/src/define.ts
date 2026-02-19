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
  const group = config?.group

  const defaultRender: StoryRenderFn = (props) => createElement(component as ComponentType<any>, props)

  const result: DefineResult<Expand<Pick<Props, IncludedProps>>, keyof D & IncludedProps> = {
    __type: 'define',
    component,
    title,
    group,
    defaults,

    // Story creation methods
    single(config?: { props?: any; render?: any }): SingleStory {
      return {
        __type: 'story',
        kind: 'single',
        props: config?.props ? { ...config.props } : undefined,
        render: config?.render ?? defaultRender,
      }
    },

    variants(config: {
      items: VariantConfig
      props?: any
      columns?: number
    }): VariantsStory {
      return {
        __type: 'story',
        kind: 'variants',
        items: config.items,
        props: config.props ? { ...config.props } : undefined,
        columns: config.columns,
        render: defaultRender,
      }
    },

    matrix(config: {
      x: VariantConfig
      y: VariantConfig[]
      props?: any
    }): MatrixStory {
      return {
        __type: 'story',
        kind: 'matrix',
        x: config.x,
        y: config.y,
        props: config.props ? { ...config.props } : undefined,
        render: defaultRender,
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
