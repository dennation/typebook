import type { ComponentType } from 'react'

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

/** Single story — one variant with fixed props */
export interface SingleStory {
  __type: 'story'
  kind: 'single'
  props?: Record<string, unknown>
}

/** Variants story — multiple variants generated from config */
export interface VariantsStory {
  __type: 'story'
  kind: 'variants'
  items: VariantConfig
  props?: Record<string, unknown>
  columns?: number
}

/** Matrix story — cross-product of x (columns) with y (rows) */
export interface MatrixStory {
  __type: 'story'
  kind: 'matrix'
  x: VariantConfig
  y: VariantConfig[]
  props?: Record<string, unknown>
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
  single(config?: { props?: Partial<Props> & MissingProps<Props, CoveredByDefaults> }): SingleStory
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
}

export interface ResolvedComponent {
  component: ComponentType<any>
  name: string
  title?: string
  group?: string
  defaults: Record<string, unknown>
  props: PropInfo[]
  stories: ResolvedStory[]
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
