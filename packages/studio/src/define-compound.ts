import type { ComponentType, ReactNode } from 'react'
import type {
  CompoundDefineConfig,
  CompoundDefineResult,
  ComponentProps,
  SingleStory,
  VariantsStory,
  MatrixStory,
  StoryRenderFn,
  AllOfConfig,
  ValuesConfig,
  GenerateConfig,
  VariantConfig,
  WrapperFn,
} from './types.js'

/**
 * Define a compound component (multiple parts composed together).
 *
 * Example:
 * ```tsx
 * const accordion = defineCompound({
 *   group: 'Data Display',
 *   parts: { root: Accordion, item: AccordionItem },
 *   props: { root: ['variant'], item: ['title'] },
 *   defaults: { item: { title: 'Item' } },
 *   render: (props) => (
 *     <Accordion {...props.root}>
 *       <AccordionItem {...props.item} key="1" />
 *     </Accordion>
 *   ),
 * })
 * ```
 */
export function defineCompound<
  Parts extends Record<string, ComponentType<any>>,
  PropsFilter extends { [K in keyof Parts]?: ReadonlyArray<string> } = {},
>(
  config: CompoundDefineConfig<Parts, PropsFilter>,
): CompoundDefineResult<{
  [K in keyof Parts]: PropsFilter[K] extends ReadonlyArray<infer P>
    ? Pick<ComponentProps<Parts[K]>, P & keyof ComponentProps<Parts[K]>>
    : ComponentProps<Parts[K]>
}> {
  const { parts, title, group, wrapper } = config
  const defaults: Record<string, Record<string, unknown>> = {}

  // Build per-part defaults
  for (const partName of Object.keys(parts)) {
    defaults[partName] = (config.defaults as any)?.[partName] ?? {}
  }

  const compoundRender: StoryRenderFn = (props) => config.render(props)

  const wrapRender = (renderFn: StoryRenderFn): StoryRenderFn => {
    if (!wrapper) return renderFn
    return (props) => wrapper(() => renderFn(props) as any)
  }

  const result: CompoundDefineResult<any> = {
    __type: 'defineCompound',
    parts,
    title,
    group,
    defaults,
    compoundRender,

    // Story creation methods
    single(config?: { props?: any; render?: any }): SingleStory {
      return {
        __type: 'story',
        kind: 'single',
        props: config?.props ? { ...config.props } : undefined,
        render: wrapRender(config?.render ?? compoundRender),
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
        render: wrapRender(compoundRender),
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
        render: wrapRender(compoundRender),
      }
    },

    // Variant config helpers — part-scoped
    allOf(part: string, prop: string): AllOfConfig {
      return {
        __type: 'allOf',
        prop: String(prop),
        part: String(part),
      }
    },

    values(part: string, prop: string, values: any[]): ValuesConfig {
      return {
        __type: 'values',
        prop: String(prop),
        values,
        part: String(part),
      }
    },

    generate(part: string, prop: string, fn: () => any, count: number): GenerateConfig {
      return {
        __type: 'generate',
        prop: String(prop),
        fn,
        count,
        part: String(part),
      }
    },
  }

  return result as any
}
