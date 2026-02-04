import type { ComponentType, ReactNode } from 'react'

// --- Config Types ---

export interface PreviewConfig {
  styles: string
  include: string
  breakpoints: boolean | Record<string, number>
}

export interface StudioConfig {
  preview: PreviewConfig
}

// --- Layout & Theme ---

export type Layout =
  | { type: 'row'; gap?: number }
  | { type: 'column'; gap?: number }
  | { type: 'grid'; columns?: number; gap?: number }

export type Theme = 'light' | 'dark'

// --- Setup Types ---

export interface SetupConfig<Props> {
  defaults: Partial<Props>
  layout?: Layout
  theme?: Theme
}

export interface VariantsOptions<Props> {
  props?: Partial<Props>
  layout?: Layout
  theme?: Theme
}

export interface PreviewExport {
  __type: 'preview'
  component: ComponentType<any>
  variants: PreviewVariant[]
  layout: Layout
  theme: Theme
}

export interface PreviewVariant {
  label: string
  props: Record<string, unknown>
}

export interface SetupResult<Props> {
  show: (props: Partial<Props>) => PreviewExport
  showVariants: (
    prop: keyof Props,
    options?: VariantsOptions<Props>,
  ) => PreviewExport
}

// --- Prop Info Types ---

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

// --- Parsed Preview Types ---

export interface ParsedSetup {
  componentName: string
  importPath: string
  variableName: string
  defaults: Record<string, unknown>
  layout?: Layout
  theme?: Theme
}

export interface ParsedExport {
  name: string
  kind: 'show' | 'showVariants'
  setupVariable: string
  prop?: string
  options?: {
    props?: Record<string, unknown>
    layout?: Layout
    theme?: Theme
  }
}

export interface ParsedPreviewFile {
  filePath: string
  setups: ParsedSetup[]
  exports: ParsedExport[]
}

// --- Component Registry ---

export interface ComponentEntry {
  name: string
  filePath: string
  importPath: string
  props: PropInfo[]
  previews: PreviewEntry[]
}

export interface PreviewEntry {
  name: string
  kind: 'show' | 'showVariants'
  prop?: string
  variants: PreviewVariant[]
  layout: Layout
  theme: Theme
}

// --- SSE / Communication ---

export interface RenderMessage {
  type: 'RENDER'
  component: string
  props: Record<string, unknown>
}

export interface SetThemeMessage {
  type: 'SET_THEME'
  theme: Theme
}

export type IframeMessage = RenderMessage | SetThemeMessage

// --- Defaults ---

export const DEFAULT_BREAKPOINTS: Record<string, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
}

export const DEFAULT_LAYOUT: Layout = { type: 'row', gap: 16 }
export const DEFAULT_THEME: Theme = 'light'
export const DEFAULT_PORT = 3000
export const LSP_POLL_INTERVAL = 500
