import type { ComponentType } from "react";
import type { Simplify } from "type-fest";
import type {
	ComponentHandle,
	PropInfo,
	RegisterConfigOmit,
	RegisterConfigPick,
} from "./types.js";

/** Register a component with a `pick` whitelist of props to document. */
export function registerComponent<
	Props extends Record<string, any>,
	Picked extends keyof Props = keyof Props,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	component: ComponentType<Props>,
	config: RegisterConfigPick<Props, Picked, Defaults>,
): ComponentHandle<Simplify<Pick<Props, Picked>>, keyof Defaults & Picked>;

/** Register a component with an `omit` blacklist of props to hide from documentation. */
export function registerComponent<
	Props extends Record<string, any>,
	Omitted extends keyof Props = never,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	component: ComponentType<Props>,
	config: RegisterConfigOmit<Props, Omitted, Defaults>,
): ComponentHandle<
	Simplify<Omit<Props, Omitted>>,
	Exclude<keyof Defaults & keyof Props, Omitted>
>;

/** Register a component with no config. All props are included in documentation. */
export function registerComponent<Props extends Record<string, any>>(
	component: ComponentType<Props>,
): ComponentHandle<Simplify<Props>, never>;

export function registerComponent(
	component: ComponentType<any>,
	config?: {
		defaultProps?: Record<string, unknown>;
		/** @internal injected by the bundler plugin at build time — never written by hand */
		__props?: PropInfo[];
	},
): ComponentHandle<any, any> {
	return {
		component,
		defaultProps: config?.defaultProps ?? {},
		props: config?.__props ?? [],
	};
}
