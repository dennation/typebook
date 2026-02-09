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

export interface DefineConfig<Props> {
  /** Display name override (defaults to displayName or function name) */
  title?: string
  /** Sidebar group (single level, e.g. 'Forms') */
  group?: string
  /** Default props applied to all stories */
  defaults?: Partial<Props>
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

/** Exported from .stories.tsx — the result of story() */
export interface StoryExport {
  __type: 'story'
  kind: 'static' | 'variants'
  component: ComponentType<any>
  defaults: Record<string, unknown>
  /** Merged props for static stories */
  props?: Record<string, unknown>
  /** Variants config for variant stories */
  variants?: VariantsConfig
  /** Extra props applied to all variants */
  extraProps?: Record<string, unknown>
}

/** Returned by define() */
export interface DefineResult<Props> {
  __type: 'define'
  component: ComponentType<Props>
  title?: string
  group?: string
  defaults: Record<string, unknown>
  story(config: StoryConfig<Expand<Props>>): StoryExport
  valuesOf(
    prop: keyof Expand<Props>,
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
  stories: ResolvedStory[]
}

// --- resolveStories() input ---

export interface StoryEntry {
  name: string
  story: StoryExport
}

export interface ResolveStoriesInput {
  props: PropInfo[]
  stories: StoryEntry[]
}
