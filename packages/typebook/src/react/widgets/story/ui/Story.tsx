import { Preview } from "@react/shared/ui/preview/index";
import type { ComponentMeta } from "@react/types";
import { createElement, useCallback } from "react";
import type { MissingProps } from "@/types";

export type StoryProps<Props extends object, Defaulted extends keyof Props> = {
	of: ComponentMeta<Props, Defaulted>;
	isolate?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Story<
	Props extends object,
	Defaulted extends keyof Props = never,
>({ of, props, isolate }: StoryProps<Props, Defaulted>) {
	const Component = of.component;

	const merged: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	};

	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	return <Preview props={merged} render={render} isolate={isolate} />;
}
