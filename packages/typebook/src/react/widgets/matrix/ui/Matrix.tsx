import { SourceBlock } from "@react/features/code-block/index";
import { componentSource } from "@react/shared/lib/componentSource";
import type { ComponentMeta } from "@react/types";
import { createElement, useCallback } from "react";
import type { MissingProps, VariantConfig } from "@/types";
import { buildMatrixRows } from "../lib/buildMatrixRows";
import { MatrixTable } from "./MatrixTable";

export type MatrixProps<Props extends object, Defaulted extends keyof Props> = {
	of: ComponentMeta<Props, Defaulted>;
	x: VariantConfig;
	y: VariantConfig[];
	isolate?: boolean;
	/** Optional caption shown above the table. */
	label?: string;
	/** Show a "show source" toggle on each cell (on by default). */
	showSource?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Matrix<
	Props extends object,
	Defaulted extends keyof Props = never,
>({
	of,
	x,
	y,
	props,
	isolate,
	label,
	showSource = true,
}: MatrixProps<Props, Defaulted>) {
	const Component = of.component;
	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	const baseProps: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	};

	const { xLabels, rows } = buildMatrixRows(x, y, of.props, baseProps);
	if (xLabels.length === 0) return null;

	const table = (
		<MatrixTable
			xLabels={xLabels}
			rows={rows}
			render={render}
			isolate={isolate}
			source={
				showSource
					? (cellProps) => (
							<SourceBlock code={componentSource(Component, cellProps)} />
						)
					: undefined
			}
		/>
	);

	if (!label) return table;

	return (
		<div>
			<p className="text-sm font-medium text-fg mb-3">{label}</p>
			{table}
		</div>
	);
}
