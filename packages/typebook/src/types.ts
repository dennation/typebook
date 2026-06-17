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

export interface MetaConfigBase<Defaults> {
	/** Default props applied to every render of this component */
	defaultProps?: Defaults;
}

export interface MetaConfigPick<
	Props,
	Picked extends keyof Props = keyof Props,
	Defaults extends Partial<Props> = Partial<Props>,
> extends MetaConfigBase<Defaults> {
	/** Props to include in documentation. If not specified, all props are included. */
	pick?: ReadonlyArray<Picked>;
}

export interface MetaConfigOmit<
	Props,
	Omitted extends keyof Props = never,
	Defaults extends Partial<Props> = Partial<Props>,
> extends MetaConfigBase<Defaults> {
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
