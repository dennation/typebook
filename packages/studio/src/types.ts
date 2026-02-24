import type { ComponentType, ReactNode } from 'react'

// --- Config ---

export interface StudioConfig {
  /** Glob pattern for .stories.tsx files */
  include?: string
  /** Glob pattern for docs page files */
  includePages?: string
  /** Output path for the generated registry file (default: './ui-studio-registry.gen.ts') */
  output?: string
  /** Output path for the generated meta file (default: './ui-studio-meta.gen.ts') */
  metaOutput?: string
}


// --- Prop Info Types (from type extraction) ---

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

// --- Component Meta (extracted by plugin, stored in ui-studio-meta.gen.ts) ---

export interface ComponentMeta {
  props: PropInfo[]
}

// --- Page Types ---

export interface PageConfig {
  /** Display name for the page in the sidebar */
  name: string
  /** Sidebar path with nesting via '/' (e.g. 'Guides') */
  path?: string
  /** Sort order within the same path group (ascending, default 0) */
  order?: number
  /** React component to render as the page content */
  content: ComponentType
}

export interface PageResult {
  __type: 'page'
  name: string
  path?: string
  order?: number
  content: ComponentType
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
  name?: string
  /** Sidebar path with nesting via '/' (e.g. 'Components/Forms') */
  path?: string
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
}

/** Manual variant configuration with explicit values */
export interface ValuesConfig {
  __type: 'values'
  prop: string
  values: unknown[]
}

/** Generate variants using a function */
export interface GenerateConfig {
  __type: 'generate'
  prop: string
  fn: () => unknown
  count: number
}

/** Variant configuration — either auto (allOf), manual (values), or generated */
export type VariantConfig = AllOfConfig | ValuesConfig | GenerateConfig

/** Render function that produces the final JSX for a story variant */
export type StoryRenderFn = (props: any) => ReactNode

/** Wrapper function that wraps all stories of a component (e.g. with a provider) */
export type WrapperFn = (Story: ComponentType) => ReactNode

/** Common fields for all story types — makes stories self-contained */
interface StoryBase {
  __type: 'story'
  component: ComponentType<any>
  defaults: Record<string, unknown>
  render: StoryRenderFn
  /** When true, render each variant inside an iframe for full CSS/JS isolation */
  isolate?: boolean
  /** Display name override (defaults to export name) */
  name?: string
  /** Path relative to component's sidebar path (default: 'Stories') */
  path?: string
  /** When true, the story is excluded from the sidebar but remains importable for docs */
  hidden?: boolean
}

/** Single story — one variant with fixed props */
export interface SingleStory extends StoryBase {
  kind: 'single'
  props?: Record<string, unknown>
}

/** Variants story — multiple variants generated from config */
export interface VariantsStory extends StoryBase {
  kind: 'variants'
  items: VariantConfig
  props?: Record<string, unknown>
  columns?: number
}

/** Matrix story — cross-product of x (columns) with y (rows) */
export interface MatrixStory extends StoryBase {
  kind: 'matrix'
  x: VariantConfig
  y: VariantConfig[]
  props?: Record<string, unknown>
}

/** Exported from .stories.tsx — the result of single(), variants(), or matrix() */
export type Story = SingleStory | VariantsStory | MatrixStory

/** Common config fields shared by single(), variants(), and matrix() */
export interface StoryConfig<Props, CoveredByDefaults extends keyof Props = never> {
  props?: Partial<Props> & MissingProps<Props, CoveredByDefaults>
  isolate?: boolean
  name?: string
  path?: string
  hidden?: boolean
}

/** Returned by define() — component page configuration + story builder */
export interface DefineResult<Props, CoveredByDefaults extends keyof Props = never> {
  __type: 'define'
  component: ComponentType<any>
  name?: string
  path?: string
  defaults: Record<string, unknown>

  // Story creation methods
  single(config?: StoryConfig<Props, CoveredByDefaults> & {
    render?: (props: Props) => ReactNode
  }): SingleStory
  variants(config: StoryConfig<Props, CoveredByDefaults> & {
    items: VariantConfig
    columns?: number
  }): VariantsStory
  matrix(config: StoryConfig<Props, CoveredByDefaults> & {
    x: VariantConfig
    y: VariantConfig[]
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


// --- Registry (output of gen file, input to <Studio />) ---

export interface ComponentEntry {
  config: DefineResult<any>
  stories: Record<string, Story>
  meta: ComponentMeta
}

export interface Registry {
  components: ComponentEntry[]
  pages: PageResult[]
}


