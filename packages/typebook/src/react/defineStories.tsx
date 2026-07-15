import { type ComponentType, createElement, type ReactNode } from "react";
import type { PropInfo, VariantConfig } from "@/types";
import type { ComponentMeta } from "./types";
import { Matrix, type MatrixProps } from "./widgets/matrix/index";
import { Story, type StoryProps } from "./widgets/story/index";
import { Variants, type VariantsProps } from "./widgets/variants/index";

/** Config for {@link defineStories}: story-level settings (author's), not component metadata. */
export interface DefineStoriesConfig<Props, Defaults extends Partial<Props>> {
	/** Default props applied to every story of this component. */
	defaultProps?: Defaults;
	/**
	 * @internal Prop metadata injected by the bundler plugin at build time — never written by hand.
	 * Extracted from `Component` and shared with the project scan.
	 */
	__props?: PropInfo[];
}

/** `<X.Story>` — one preview. `of` is baked in, so it's dropped from the public props. */
export type StoryViewProps<
	Props extends object,
	Defaulted extends keyof Props,
> = Omit<StoryProps<Props, Defaulted>, "of">;

/** `<X.Variants axis="size" />` — a grid along one prop axis (named by a `keyof`, not `allOf`). */
export type VariantsViewProps<
	Props extends object,
	Defaulted extends keyof Props,
> = Omit<VariantsProps<Props, Defaulted>, "of" | "items"> & {
	/** The prop to vary along. */
	axis: keyof Props;
	/** Explicit values (default: every value of the prop's type). */
	values?: Props[keyof Props][];
	/** Generate values by calling `generate()` `count` times (overrides `values`). */
	generate?: () => Props[keyof Props];
	count?: number;
};

/** `<X.Matrix x="a" y={["b"]} />` — cross-product of an x axis and y axes, named by `keyof`. */
export type MatrixViewProps<
	Props extends object,
	Defaulted extends keyof Props,
> = Omit<MatrixProps<Props, Defaulted>, "of" | "x" | "y"> & {
	x: keyof Props;
	y: (keyof Props)[];
};

/**
 * The namespace returned by {@link defineStories}: ready-to-render story views with the component
 * baked in. `Props` is the **first** type argument so the bundler plugin can read it off the return
 * type (same seam `getComponentMeta` used) to inject `__props`.
 */
export interface StoriesNamespace<
	Props extends object,
	Defaulted extends keyof Props = never,
> {
	Story: (props: StoryViewProps<Props, Defaulted>) => ReactNode;
	Variants: (props: VariantsViewProps<Props, Defaulted>) => ReactNode;
	Matrix: (props: MatrixViewProps<Props, Defaulted>) => ReactNode;
	/** The component's scanned prop metadata — e.g. for a `<PropsReference>` table. */
	props: PropInfo[];
}

/**
 * Define the stories for a component: returns a `{ Story, Variants, Matrix }` namespace with the
 * component (and its scanned props) baked in — no `of`. `config` holds story-level settings
 * (`defaultProps`); component prop metadata (`__props`) is injected at build time from the scan.
 *
 * ```tsx
 * export const ButtonStories = defineStories(Button, { defaultProps: { children: "Click" } })
 * <ButtonStories.Variants axis="size" />
 * ```
 */
export function defineStories<
	Props extends object,
	Defaults extends Partial<Props> = Record<PropertyKey, never>,
>(
	component: ComponentType<Props>,
	config?: DefineStoriesConfig<Props, Defaults>,
): StoriesNamespace<Props, keyof Defaults & keyof Props> {
	const handle: ComponentMeta<Props> = {
		component,
		defaultProps: (config?.defaultProps ?? {}) as Record<string, unknown>,
		props: config?.__props ?? [],
	};

	// The public view-prop types are exact; bridging them to the generic widgets (which read a
	// ComponentMeta<any> handle) needs untyped element props — hence the local `render` helper.
	// biome-ignore lint/suspicious/noExplicitAny: internal bridge only; public API stays typed.
	const render = (view: ComponentType<any>, props: object): ReactNode =>
		createElement(view, { of: handle, ...props });

	return {
		Story: (p) => render(Story, p),
		Variants: ({ axis, values, generate, count, ...rest }) =>
			render(Variants, {
				items: axisToConfig(axis, values, generate, count),
				...rest,
			}),
		Matrix: ({ x, y, ...rest }) =>
			render(Matrix, {
				x: axisToConfig(x),
				y: y.map((axis) => axisToConfig(axis)),
				...rest,
			}),
		props: handle.props,
	};
}

/** Translate the `axis` / `values` / `generate` props into an internal {@link VariantConfig}. */
function axisToConfig(
	prop: PropertyKey,
	values?: unknown[],
	generate?: () => unknown,
	count?: number,
): VariantConfig {
	const name = String(prop);
	if (generate)
		return { __type: "generate", prop: name, fn: generate, count: count ?? 1 };
	if (values) return { __type: "values", prop: name, values };
	return { __type: "allOf", prop: name };
}
