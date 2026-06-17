import type { AllOfConfig, GenerateConfig, ValuesConfig } from "@/types.js";
import type { ComponentMeta, PropsOf } from "./types.js";

/**
 * Auto-generate variants for a prop from its TypeScript type
 * (literal union or boolean). The first argument is the `ComponentMeta`
 * returned by `getComponentMeta()` — used for prop-name autocomplete.
 */
export function allOf<R extends ComponentMeta<any>, K extends keyof PropsOf<R>>(
	_of: R,
	prop: K,
): AllOfConfig {
	return { __type: "allOf", prop: String(prop) };
}

/**
 * Manual variant configuration with explicit values for a prop.
 * Values are typed against the prop's TypeScript type.
 */
export function values<
	R extends ComponentMeta<any>,
	K extends keyof PropsOf<R>,
>(_of: R, prop: K, values: PropsOf<R>[K][]): ValuesConfig {
	return { __type: "values", prop: String(prop), values };
}

/**
 * Generate `count` variants for a prop by calling `fn()` once per variant.
 * The function's return type is constrained to the prop's TypeScript type.
 */
export function generate<
	R extends ComponentMeta<any>,
	K extends keyof PropsOf<R>,
>(_of: R, prop: K, fn: () => PropsOf<R>[K], count: number): GenerateConfig {
	return { __type: "generate", prop: String(prop), fn, count };
}
