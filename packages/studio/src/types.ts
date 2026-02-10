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

/** Marker returned by valuesOf() — signals auto-generation */
export interface ValuesOfMarker {
  __type: 'valuesOf'
  prop: string
  columns?: number
}

/** Manual variant configuration with explicit values */
export interface ManualVariantsConfig {
  prop: string
  values: unknown[]
  columns?: number
}

/** Variants config — either auto (valuesOf) or manual */
export type VariantsConfig = ValuesOfMarker | ManualVariantsConfig

export interface StoryConfig<Props> {
  /** Fixed props (merged with defaults) */
  props?: Partial<Props>
  /** Variants configuration */
  variants?: VariantsConfig
}

/** Static story — single variant with fixed props */
export interface StaticStory {
  __type: 'story'
  kind: 'static'
  component: ComponentType<any>
  props?: Record<string, unknown>
}

/** Variant story — multiple variants generated from config */
export interface VariantStory {
  __type: 'story'
  kind: 'variants'
  component: ComponentType<any>
  variants?: VariantsConfig
  props?: Record<string, unknown>
}

/** Exported from .stories.tsx — the result of story() */
export type Story = StaticStory | VariantStory

/** Returned by define() */
export interface DefineResult<Props> {
  __type: 'define'
  component: ComponentType<any>
  title?: string
  group?: string
  defaults: Record<string, unknown>
  story(config: StoryConfig<any>): Story
  valuesOf(
    prop: keyof Props,
    options?: { columns?: number },
  ): ValuesOfMarker
}

// --- Resolved Types (output of resolveStories) ---

export interface ResolvedVariant {
  label: string
  props: Record<string, unknown>
}

export interface ResolvedStory {
  name: string
  kind: 'static' | 'variants'
  variants: ResolvedVariant[]
  columns?: number
}

export interface ResolvedComponent {
  component: ComponentType<any>
  name: string
  title?: string
  group?: string
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
