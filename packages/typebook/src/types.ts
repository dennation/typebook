import type { ComponentType } from "react";
import type { RequiredKeysOf } from "type-fest";

export interface TypebookConfig {
	/** Additional packages whose type declarations mark props as inherited (e.g. ['@heroui/theme']) */
	inheritedProviders?: string[];
}

export type PropType =
	| { kind: "literal"; values: string[] }
	| { kind: "boolean" }
	| { kind: "string" }
	| { kind: "number" }
	| { kind: "node" }
	| { kind: "function"; raw?: string }
	| { kind: "unknown"; raw: string };

export interface PropInfo {
	name: string;
	optional: boolean;
	type: PropType;
	/** When true, the prop is inherited from framework types (e.g. React.HTMLAttributes) */
	inherited?: boolean;
	/**
	 * Source text of the default value from the component's parameter destructuring
	 * (e.g. `function Btn({ size = 'md' })` → `"'md'"`). Raw expression as written —
	 * for literals it's the literal source, for non-literals it's the expression text.
	 */
	defaultValue?: string;
	/**
	 * JSDoc description text from the prop's declaration in the source interface or
	 * type alias (the prose written above the field, before any `@tag` lines).
	 */
	description?: string;
}

/** Props the caller must provide (required keys not covered by defaultProps) */
export type MissingProps<
	Props extends object,
	Defaulted extends keyof Props,
> = Pick<Props, Exclude<RequiredKeysOf<Props>, Defaulted>>;

/** Extract `Props` type from a ComponentHandle */
export type PropsOf<R> = R extends ComponentHandle<infer P, any> ? P : never;

/** Extract the keys covered by `defaultProps` from a ComponentHandle */
export type DefaultedOf<R> =
	R extends ComponentHandle<any, infer K> ? K : never;

export interface RegisterConfigBase<Defaults> {
	/** Default props applied to every render of this component */
	defaultProps?: Defaults;
}

export interface RegisterConfigPick<
	Props,
	Picked extends keyof Props = keyof Props,
	Defaults extends Partial<Props> = Partial<Props>,
> extends RegisterConfigBase<Defaults> {
	/** Props to include in documentation. If not specified, all props are included. */
	pick?: ReadonlyArray<Picked>;
}

export interface RegisterConfigOmit<
	Props,
	Omitted extends keyof Props = never,
	Defaults extends Partial<Props> = Partial<Props>,
> extends RegisterConfigBase<Defaults> {
	/** Props to omit from documentation. */
	omit?: ReadonlyArray<Omitted>;
}

/** Auto-generate variants from prop type (boolean/literal) */
export interface AllOfConfig {
	__type: "allOf";
	prop: string;
}

/** Manual variant configuration with explicit values */
export interface ValuesConfig {
	__type: "values";
	prop: string;
	values: unknown[];
}

/** Generate variants using a function */
export interface GenerateConfig {
	__type: "generate";
	prop: string;
	fn: () => unknown;
	count: number;
}

/** Variant configuration — either auto (allOf), manual (values), or generated */
export type VariantConfig = AllOfConfig | ValuesConfig | GenerateConfig;

/**
 * Returned by `registerComponent(Component, config)`. Self-contained: holds the
 * component reference, default props, and the extracted prop metadata. `props` is
 * empty as authored — the bundler plugin injects the real `PropInfo[]` into the
 * call at build time (see `core/transform.ts`). `<Story>`/`<Variants>`/`<Matrix>`/
 * `<Playground>` read everything they need from the handle; there is no registry.
 *
 * Variant configs are built via the standalone `allOf` / `values` / `generate`
 * utilities, which take a `ComponentHandle` as their first argument for prop-name
 * autocomplete and value typing.
 */
export interface ComponentHandle<Props, Defaulted extends keyof Props = never> {
	component: ComponentType<Props>;
	defaultProps: Record<string, unknown>;
	/** Prop metadata, injected at build time by the bundler plugin (empty without it). */
	props: PropInfo[];

	/** Phantom — keeps Defaulted reachable for `<Story>`/`<Variants>`/`<Matrix>` typing */
	readonly __defaulted?: (k: Defaulted) => void;
}
