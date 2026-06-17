import { getGridStyle } from "@react/shared/lib/getGridStyle.js";
import { PreviewFrame } from "@react/shared/ui/preview/index.js";
import type { ComponentMeta } from "@react/types.js";
import { createElement, useCallback } from "react";
import { resolveVariantConfig } from "@/resolve.js";
import type { MissingProps, VariantConfig } from "@/types.js";

export type VariantsProps<
	Props extends object,
	Defaulted extends keyof Props,
> = {
	of: ComponentMeta<Props, Defaulted>;
	items: VariantConfig;
	columns?: number;
	isolate?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Variants<
	Props extends object,
	Defaulted extends keyof Props = never,
>({ of, items, props, columns, isolate }: VariantsProps<Props, Defaulted>) {
	const Component = of.component;

	const baseProps: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	};

	const variants = resolveVariantConfig(items, of.props, baseProps);
	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	return (
		<div style={getGridStyle(variants.length, columns)}>
			{variants.map((v) => (
				<PreviewFrame
					key={v.label}
					label={v.label}
					props={v.props}
					render={render}
					isolate={isolate}
				/>
			))}
		</div>
	);
}
