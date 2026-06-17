import type { ComponentType } from "react";
import type { Simplify } from "type-fest";
import type { MetaConfigOmit, MetaConfigPick, PropInfo } from "@/types";
import type { ComponentMeta } from "./types";

/** Register a component with a `pick` whitelist of props to document. */
export function getComponentMeta<
	Props extends Record<string, any>,
	Picked extends keyof Props = keyof Props,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	component: ComponentType<Props>,
	config: MetaConfigPick<Props, Picked, Defaults>,
): ComponentMeta<Simplify<Pick<Props, Picked>>, keyof Defaults & Picked>;

/** Register a component with an `omit` blacklist of props to hide from documentation. */
export function getComponentMeta<
	Props extends Record<string, any>,
	Omitted extends keyof Props = never,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	component: ComponentType<Props>,
	config: MetaConfigOmit<Props, Omitted, Defaults>,
): ComponentMeta<
	Simplify<Omit<Props, Omitted>>,
	Exclude<keyof Defaults & keyof Props, Omitted>
>;

/** Register a component with no config. All props are included in documentation. */
export function getComponentMeta<Props extends Record<string, any>>(
	component: ComponentType<Props>,
): ComponentMeta<Simplify<Props>, never>;

export function getComponentMeta(
	component: ComponentType<any>,
	config?: {
		defaultProps?: Record<string, unknown>;
		/** @internal injected by the bundler plugin at build time — never written by hand */
		__props?: PropInfo[];
	},
): ComponentMeta<any, any> {
	return {
		component,
		defaultProps: config?.defaultProps ?? {},
		props: config?.__props ?? [],
	};
}
