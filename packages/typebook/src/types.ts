import type { ComponentType, ReactNode } from 'react'
import type { RequiredKeysOf } from 'type-fest'

export interface TypebookConfig {
  /** Path to the generated registry file (default: './src/ui-registry.gen.ts') */
  registryFile?: string
  /** Additional packages whose type declarations mark props as inherited (e.g. ['@heroui/theme']) */
  inheritedProviders?: string[]
  /**
   * Output file for the generated snippet source map (default:
   * './src/snippets.gen.ts'). Source extracted from each `<Snippet name="…">`
   * element is emitted as a `name → code` entry the runtime `<Snippet>` reads
   * from React context.
   */
  snippetsFile?: string
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

/** Props the caller must provide (required keys not covered by defaultProps) */
export type MissingProps<Props extends object, Defaulted extends keyof Props> =
  Pick<Props, Exclude<RequiredKeysOf<Props>, Defaulted>>

/** Extract `Props` type from a ComponentHandle */
export type PropsOf<R> = R extends ComponentHandle<infer P, any> ? P : never

/** Extract the keys covered by `defaultProps` from a ComponentHandle */
export type DefaultedOf<R> = R extends ComponentHandle<any, infer K> ? K : never

export interface RegisterConfigBase<Defaults> {
  /** Default props applied to every render of this component */
  defaultProps?: Defaults
}

export interface RegisterConfigPick<
  Props,
  Picked extends keyof Props = keyof Props,
  Defaults extends Partial<Props> = Partial<Props>,
> extends RegisterConfigBase<Defaults> {
  /** Props to include in documentation. If not specified, all props are included. */
  pick?: ReadonlyArray<Picked>
}

export interface RegisterConfigOmit<
  Props,
  Omitted extends keyof Props = never,
  Defaults extends Partial<Props> = Partial<Props>,
> extends RegisterConfigBase<Defaults> {
  /** Props to omit from documentation. */
  omit?: ReadonlyArray<Omitted>
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
 * Returned by `registerComponent(id, Component, config)`. Holds the registry key,
 * the component reference, and default props. Variant configs are built via the
 * standalone `allOf` / `values` / `generate` utilities, which take a
 * `ComponentHandle` as their first argument for prop-name autocomplete and value
 * typing.
 */
export interface ComponentHandle<Props, Defaulted extends keyof Props = never> {
  id: string
  component: ComponentType<Props>
  defaultProps: Record<string, unknown>

  /** Phantom — keeps Defaulted reachable for `<Story>`/`<Variants>`/`<Matrix>` typing */
  readonly __defaulted?: (k: Defaulted) => void
}

/** Object keyed by registration id → ComponentMeta. Built from the generated registry. */
export type UIRegistry = Record<string, ComponentMeta>

/**
 * Object keyed by `<Snippet>` name → its extracted source text. Built from the
 * generated `snippets.gen.ts` and passed to `TypebookProvider`.
 */
export type SnippetMap = Record<string, string>

/**
 * How a {@link MenuItem} decides whether it is "active" for the current path.
 * - `'exact'` (default): `pathname === href`
 * - `'prefix'`: `pathname` starts with `href`
 * - `RegExp`: tested against `pathname`
 * - predicate: full control
 */
export type MenuMatch =
  | 'exact'
  | 'prefix'
  | RegExp
  | ((pathname: string) => boolean)

/** Runtime state passed to a {@link MenuSlot} for the item being rendered. */
export interface MenuItemState {
  /** The item matched the current path (per its `match`). */
  active: boolean
  /** The item's nested `items` are expanded. */
  open: boolean
}

/** Render a custom node before/after a menu item (e.g. a divider or heading). */
export type MenuSlot = (item: MenuItem, state: MenuItemState) => ReactNode

/**
 * A single navigation entry. The shape is uniform: a node with `items` is a
 * (collapsible) section, a node with `href` is a link, and a node with both is
 * a clickable section. Order is the array position — there is no `order` field
 * on the stored model (see {@link MenuItemInput} for the authoring/adapter input).
 */
export interface MenuItem {
  title: string
  /** Link target — internal route or external URL. Absent → pure container. */
  href?: string
  /** Nested entries → renders as a collapsible section. */
  items?: MenuItem[]
  icon?: ReactNode
  /** Active-state matching policy. Default `'exact'`. */
  match?: MenuMatch
  /** Initial expanded state when `items` is present. Default `true`. */
  defaultOpen?: boolean
  /** Custom JSX rendered before the item. */
  before?: MenuSlot
  /** Custom JSX rendered after the item. */
  after?: MenuSlot
}

/** Stored, normalized navigation tree consumed by the renderer. */
export type Menu = MenuItem[]

/**
 * Authoring/adapter input: a {@link MenuItem} plus an `order` hint used to sort
 * siblings (router adapters emit items in arbitrary order). {@link defineMenu}
 * sorts by `order`, de-duplicates by `href`, strips `order`, and returns a
 * plain {@link Menu}.
 */
export interface MenuItemInput extends MenuItem {
  order?: number
  items?: MenuItemInput[]
}

/** Input array accepted by {@link defineMenu}. */
export type MenuInput = MenuItemInput[]
