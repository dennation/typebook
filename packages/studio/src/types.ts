import type { ComponentType, ReactNode } from 'react'

// --- Config ---

export interface StudioConfig {
  /** Glob pattern for .stories.tsx files */
  include?: string
  /** Output path for the generated file (default: './studio.gen.ts') */
  output?: string
}

// --- Vite Plugin Config ---

export type VitePluginConfig = StudioConfig

// --- Prop Info Types (from LSP extraction) ---

export type PropType =
  | { kind: 'literal'; values: string[] }
  | { kind: 'boolean' }
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'node' }
  | { kind: 'function' }
  | { kind: 'unknown'; raw: string }

export interface PropInfo {
  name: string
  optional: boolean
  type: PropType
}

// --- Define API Types ---

/**
 * Flattens composed interfaces so tsgo hover shows inline types
 * instead of opaque type aliases.
 */
export type Expand<T> = {
  [K in keyof T]: T[K] extends string ? T[K] & string : T[K]
} & {}

/** Keys that are required (non-optional) in T */
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K
}[keyof T]

/** Props that must be provided in story.props (required keys not covered by defaults) */
export type MissingProps<Props, CoveredByDefaults extends keyof Props> =
  Pick<Props, Exclude<RequiredKeys<Props>, CoveredByDefaults>>

export interface DefineConfig<Props, IncludedProps extends keyof Props = keyof Props> {
  /** Display name override (defaults to displayName or function name) */
  title?: string
  /** Sidebar group (single level, e.g. 'Forms') */
  group?: string
  /** Default props applied to all stories */
  defaults?: Partial<Props>
  /**
   * Props to include in documentation and type extraction.
   * If not specified, all props are included.
   */
  props?: ReadonlyArray<IncludedProps>
  /** Wrapper applied to all stories (e.g. a theme provider) */
  wrapper?: WrapperFn
}

/** Auto-generate variants from prop type (boolean/literal) */
export interface AllOfConfig {
  __type: 'allOf'
  prop: string
  /** For compound components: which part this prop belongs to */
  part?: string
}

/** Manual variant configuration with explicit values */
export interface ValuesConfig {
  __type: 'values'
  prop: string
  values: unknown[]
  /** For compound components: which part this prop belongs to */
  part?: string
}

/** Generate variants using a function */
export interface GenerateConfig {
  __type: 'generate'
  prop: string
  fn: () => unknown
  count: number
  /** For compound components: which part this prop belongs to */
  part?: string
}

/** Variant configuration — either auto (allOf), manual (values), or generated */
export type VariantConfig = AllOfConfig | ValuesConfig | GenerateConfig

/** Render function that produces the final JSX for a story variant */
export type StoryRenderFn = (props: any) => ReactNode

/** Wrapper function that wraps all stories of a component (e.g. with a provider) */
export type WrapperFn = (Story: ComponentType) => ReactNode

/** Single story — one variant with fixed props */
export interface SingleStory {
  __type: 'story'
  kind: 'single'
  props?: Record<string, unknown>
  render: StoryRenderFn
}

/** Variants story — multiple variants generated from config */
export interface VariantsStory {
  __type: 'story'
  kind: 'variants'
  items: VariantConfig
  props?: Record<string, unknown>
  columns?: number
  render: StoryRenderFn
}

/** Matrix story — cross-product of x (columns) with y (rows) */
export interface MatrixStory {
  __type: 'story'
  kind: 'matrix'
  x: VariantConfig
  y: VariantConfig[]
  props?: Record<string, unknown>
  render: StoryRenderFn
}

/** Exported from .stories.tsx — the result of single(), variants(), or matrix() */
export type Story = SingleStory | VariantsStory | MatrixStory

/** Returned by define() */
export interface DefineResult<Props, CoveredByDefaults extends keyof Props = never> {
  __type: 'define'
  component: ComponentType<any>
  title?: string
  group?: string
  defaults: Record<string, unknown>

  // Story creation methods
  single(config?: {
    props?: Partial<Props> & MissingProps<Props, CoveredByDefaults>
    render?: (props: Props) => ReactNode
  }): SingleStory
  variants(config: {
    items: VariantConfig
    props?: Partial<Props> & MissingProps<Props, CoveredByDefaults>
    columns?: number
  }): VariantsStory
  matrix(config: {
    x: VariantConfig
    y: VariantConfig[]
    props?: Partial<Props> & MissingProps<Props, CoveredByDefaults>
  }): MatrixStory

  // Variant config helpers
  allOf<K extends keyof Props>(prop: K): AllOfConfig
  values<K extends keyof Props>(prop: K, values: Props[K][]): ValuesConfig
  generate<K extends keyof Props>(
    prop: K,
    fn: () => Props[K],
    count: number,
  ): GenerateConfig
}

// --- Resolved Types (output of resolveStories) ---

export interface ResolvedVariant {
  label: string
  props: Record<string, unknown>
}

/** Matrix row — one secondary prop value crossed with all primary values */
export interface MatrixRow {
  label: string // e.g., "solid" or "variant=solid"
  variants: ResolvedVariant[] // One for each primary prop value
}

/** Matrix structure for resolved matrix stories */
export interface ResolvedMatrix {
  primaryProp: string
  primaryValues: string[] // Column headers
  rows: MatrixRow[] // One row per secondary prop value
}

export interface ResolvedStory {
  name: string
  kind: 'single' | 'variants' | 'matrix'
  variants?: ResolvedVariant[]
  columns?: number
  matrix?: ResolvedMatrix
  render: StoryRenderFn
}

// --- resolveStories() input ---

export interface StoryEntry {
  name: string
  story: Story
}

export interface ResolveStoriesInput {
  props: PropInfo[]
  stories: StoryEntry[]
}

// --- Compound Component Types ---

/** Props-filter helper: extracts component props from ComponentType */
export type ComponentProps<C> = C extends ComponentType<infer P> ? P : never

/** Config for defineCompound() */
export interface CompoundDefineConfig<
  Parts extends Record<string, ComponentType<any>>,
  PropsFilter extends { [K in keyof Parts]?: ReadonlyArray<string> },
> {
  /** Display name override */
  title?: string
  /** Sidebar group */
  group?: string
  /** Map of part names to their React components */
  parts: Parts
  /** Props to include per part (optional, defaults to all) */
  props?: PropsFilter
  /** Default props per part */
  defaults?: { [K in keyof Parts]?: Partial<ComponentProps<Parts[K]>> }
  /** Wrapper applied to all stories */
  wrapper?: WrapperFn
  /** Render function for the composed component */
  render: (props: { [K in keyof Parts]: any }) => ReactNode
}

/** Result returned by defineCompound() */
export interface CompoundDefineResult<
  PartsProps extends Record<string, Record<string, any>>,
> {
  __type: 'defineCompound'
  parts: Record<string, ComponentType<any>>
  title?: string
  group?: string
  defaults: Record<string, Record<string, unknown>>
  /** Composition render function */
  compoundRender: (props: Record<string, Record<string, unknown>>) => ReactNode

  // Story creation methods
  single(config?: {
    props?: { [K in keyof PartsProps]?: Partial<PartsProps[K]> }
    render?: (props: { [K in keyof PartsProps]: PartsProps[K] }) => ReactNode
  }): SingleStory
  variants(config: {
    items: VariantConfig
    props?: { [K in keyof PartsProps]?: Partial<PartsProps[K]> }
    columns?: number
  }): VariantsStory
  matrix(config: {
    x: VariantConfig
    y: VariantConfig[]
    props?: { [K in keyof PartsProps]?: Partial<PartsProps[K]> }
  }): MatrixStory

  // Variant config helpers (take part name + prop name)
  allOf<P extends keyof PartsProps & string>(
    part: P,
    prop: keyof PartsProps[P] & string,
  ): AllOfConfig
  values<P extends keyof PartsProps & string>(
    part: P,
    prop: keyof PartsProps[P] & string,
    values: PartsProps[P][keyof PartsProps[P]][],
  ): ValuesConfig
  generate<P extends keyof PartsProps & string>(
    part: P,
    prop: keyof PartsProps[P] & string,
    fn: () => PartsProps[P][keyof PartsProps[P]],
    count: number,
  ): GenerateConfig
}

/** Info about a single part in a resolved compound component */
export interface CompoundPartInfo {
  component: ComponentType<any>
  props: PropInfo[]
  defaults: Record<string, unknown>
}

// Extend ResolvedComponent with compound support
export interface ResolvedComponent {
  component: ComponentType<any>
  name: string
  title?: string
  group?: string
  defaults: Record<string, unknown>
  props: PropInfo[]
  stories: ResolvedStory[]
  /** Whether this is a compound component */
  compound?: boolean
  /** Part info for compound components */
  parts?: Record<string, CompoundPartInfo>
  /** Composition render function for compound components */
  compoundRender?: (props: Record<string, Record<string, unknown>>) => ReactNode
}

/** Input for resolveCompound() */
export interface ResolveCompoundInput {
  partProps: Record<string, PropInfo[]>
  stories: StoryEntry[]
}
