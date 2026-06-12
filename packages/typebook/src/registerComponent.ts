import type { ComponentType } from "react";
import type { Simplify } from "type-fest";
import type {
	ComponentHandle,
	RegisterConfigOmit,
	RegisterConfigPick,
} from "./types.js";

/** Register a component with a `pick` whitelist of props to document. */
export function registerComponent<
	Props extends Record<string, any>,
	Picked extends keyof Props = keyof Props,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	id: string,
	component: ComponentType<Props>,
	config: RegisterConfigPick<Props, Picked, Defaults>,
): ComponentHandle<Simplify<Pick<Props, Picked>>, keyof Defaults & Picked>;

/** Register a component with an `omit` blacklist of props to hide from documentation. */
export function registerComponent<
	Props extends Record<string, any>,
	Omitted extends keyof Props = never,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	id: string,
	component: ComponentType<Props>,
	config: RegisterConfigOmit<Props, Omitted, Defaults>,
): ComponentHandle<
	Simplify<Omit<Props, Omitted>>,
	Exclude<keyof Defaults & keyof Props, Omitted>
>;

/** Register a component with no config. All props are included in documentation. */
export function registerComponent<Props extends Record<string, any>>(
	id: string,
	component: ComponentType<Props>,
): ComponentHandle<Simplify<Props>, never>;

export function registerComponent(
	id: string,
	component: ComponentType<any>,
	config?: { defaultProps?: Record<string, unknown> },
): ComponentHandle<any, any> {
	return {
		id,
		component,
		defaultProps: config?.defaultProps ?? {},
	};
}
