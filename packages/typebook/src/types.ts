import type { ComponentType } from 'react'

export interface TypebookConfig {
  /** Path to the generated registry file (default: './src/ui-registry.gen.ts') */
  registryFile?: string
  /** Additional packages whose type declarations mark props as inherited (e.g. ['@heroui/theme']) */
  inheritedProviders?: string[]
}

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
  /** When true, the prop is inherited from framework types (e.g. React.HTMLAttributes) */
  inherited?: boolean
  /**
   * Source text of the default value from the component's parameter destructuring
   * (e.g. `function Btn({ size = 'md' })` → `"'md'"`). Raw expression as written —
   * for literals it's the literal source, for non-literals it's the expression text.
   */
  defaultValue?: string
  /**
   * JSDoc description text from the prop's declaration in the source interface or
   * type alias (the prose written above the field, before any `@tag` lines).
   */
  description?: string
}

export interface ComponentMeta {
  /** The original component reference (used by `<Story>`-style components to render). */
  component: ComponentType<any>
  /** Imported export name in the source file (e.g. `"Button"`). */
  componentName: string
  props: PropInfo[]
}

/** Keys that are required (non-optional) in T */
export type RequiredKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K
}[keyof T]

/** Props the caller must provide (required keys not covered by defaultProps) */
export type MissingProps<Props, CoveredByDefaults extends keyof Props> =
  Pick<Props, Exclude<RequiredKeys<Props>, CoveredByDefaults>>

/** Extract `Props` type from a Registration */
export type PropsOf<R> = R extends Registration<infer P, any> ? P : never

/** Extract the keys covered by `defaultProps` from a Registration */
export type CoveredOf<R> = R extends Registration<any, infer K> ? K : never

export interface RegisterConfig<Props, IncludedProps extends keyof Props = keyof Props> {
  /** Default props applied to every render of this component */
  defaultProps?: Partial<Props>
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

/**
 * Returned by `register(id, Component, config)`. Holds the registry key, the
 * component reference, and default props. Variant configs are built via the
 * standalone `allOf` / `values` / `generate` utilities, which take a
 * `Registration` as their first argument for prop-name autocomplete and value
 * typing.
 */
export interface Registration<Props, CoveredByDefaults extends keyof Props = never> {
  id: string
  component: ComponentType<any>
  defaultProps: Record<string, unknown>

  /** Phantom — keeps Props reachable for `allOf`/`values`/`generate` typing */
  readonly __props?: (p: Props) => void
  /** Phantom — keeps CoveredByDefaults reachable for `<Story>`/`<VariantsStory>`/`<MatrixStory>` typing */
  readonly __coveredByDefaults?: (k: CoveredByDefaults) => void
}

/** Object keyed by registration id → ComponentMeta. Built from the generated registry. */
export type UIRegistry = Record<string, ComponentMeta>
