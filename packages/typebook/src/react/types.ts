import type { ComponentType } from "react";
import type { PropInfo } from "@/types";

/**
 * Returned by `getComponentMeta(Component, config)`. Self-contained: holds the
 * component reference, default props, and the extracted prop metadata. `props` is
 * empty as authored — the bundler plugin injects the real `PropInfo[]` into the
 * call at build time (see `core/transform.ts`). `<Story>`/`<Variants>`/`<Matrix>`
 * read everything they need from the handle; there is no registry.
 *
 * Lives in the React entry (not the base `types.ts`) because it references React's
 * `ComponentType` — the base entry must stay free of any React dependency.
 *
 * Variant configs are built via the standalone `allOf` / `values` / `generate`
 * utilities, which take a `ComponentMeta` as their first argument for prop-name
 * autocomplete and value typing.
 */
export interface ComponentMeta<Props, Defaulted extends keyof Props = never> {
	component: ComponentType<Props>;
	defaultProps: Record<string, unknown>;
	/** Prop metadata, injected at build time by the bundler plugin (empty without it). */
	props: PropInfo[];

	/** Phantom — keeps Defaulted reachable for `<Story>`/`<Variants>`/`<Matrix>` typing */
	readonly __defaulted?: (k: Defaulted) => void;
}

/** Extract `Props` type from a ComponentMeta */
export type PropsOf<R> = R extends ComponentMeta<infer P, any> ? P : never;

/** Extract the keys covered by `defaultProps` from a ComponentMeta */
export type DefaultedOf<R> = R extends ComponentMeta<any, infer K> ? K : never;
