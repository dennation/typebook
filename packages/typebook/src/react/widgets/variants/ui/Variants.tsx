import { SourceBlock } from "@react/features/code-block/index";
import { componentSource } from "@react/shared/lib/componentSource";
import { getGridStyle } from "@react/shared/lib/getGridStyle";
import { PreviewFrame } from "@react/shared/ui/preview/index";
import type { ComponentMeta } from "@react/types";
import { createElement, useCallback } from "react";
import { resolveVariantConfig } from "@/resolve";
import type { MissingProps, VariantConfig } from "@/types";

export type VariantsProps<
	Props extends object,
	Defaulted extends keyof Props,
> = {
	of: ComponentMeta<Props, Defaulted>;
	items: VariantConfig;
	columns?: number;
	isolate?: boolean;
	/** Optional caption shown above the grid. */
	label?: string;
	/** Show a "show source" toggle on each cell, revealing that variant's serialized usage (on by default). */
	showSource?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Variants<
	Props extends object,
	Defaulted extends keyof Props = never,
>({
	of,
	items,
	props,
	columns,
	isolate,
	showSource = true,
	label,
}: VariantsProps<Props, Defaulted>) {
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

	const grid = (
		<div style={getGridStyle(variants.length, columns)}>
			{variants.map((v) => (
				<PreviewFrame
					key={v.label}
					label={v.label}
					props={v.props}
					render={render}
					isolate={isolate}
					source={
						showSource ? (
							<SourceBlock code={componentSource(Component, v.props)} />
						) : undefined
					}
				/>
			))}
		</div>
	);

	if (!label) return grid;

	return (
		<div>
			<p className="text-sm font-medium text-fg mb-3">{label}</p>
			{grid}
		</div>
	);
}
