import { useComponentMeta } from "@react/entities/component-meta/index.js";
import { createElement, useCallback } from "react";
import type { ComponentHandle, MissingProps, VariantConfig } from "@/types.js";
import { buildMatrixRows } from "../lib/buildMatrixRows.js";
import { MatrixTable } from "./MatrixTable.js";

export type MatrixProps<Props extends object, Defaulted extends keyof Props> = {
	of: ComponentHandle<Props, Defaulted>;
	x: VariantConfig;
	y: VariantConfig[];
	isolate?: boolean;
} & (keyof MissingProps<Props, Defaulted> extends never
	? { props?: Partial<Props> }
	: { props: Partial<Props> & MissingProps<Props, Defaulted> });

export function Matrix<
	Props extends object,
	Defaulted extends keyof Props = never,
>({ of, x, y, props, isolate }: MatrixProps<Props, Defaulted>) {
	const Component = of.component;
	const meta = useComponentMeta(of.id);
	const render = useCallback(
		(p: any) => createElement(Component, p),
		[Component],
	);

	const baseProps: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	};

	const { xLabels, rows } = buildMatrixRows(x, y, meta?.props ?? [], baseProps);
	if (xLabels.length === 0) return null;

	return (
		<MatrixTable
			xLabels={xLabels}
			rows={rows}
			render={render}
			isolate={isolate}
		/>
	);
}
