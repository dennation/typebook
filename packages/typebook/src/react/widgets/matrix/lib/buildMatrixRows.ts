import { getVariantProp, resolveVariantConfig } from "@/resolve";
import type { PropInfo, VariantConfig } from "@/types";

export interface MatrixCell {
	label: string;
	props: Record<string, unknown>;
}

export interface MatrixRow {
	label: string;
	cells: MatrixCell[];
}

export interface MatrixData {
	xLabels: string[];
	rows: MatrixRow[];
}

/**
 * Pure builder: turns x/y variant configs into a 2D matrix of cells with
 * merged props. Independent of React — kept separate so the layout component
 * can stay declarative.
 */
export function buildMatrixRows(
	x: VariantConfig,
	y: VariantConfig[],
	propInfos: PropInfo[],
	baseProps: Record<string, unknown>,
): MatrixData {
	const xVariants = resolveVariantConfig(x, propInfos, {});
	if (xVariants.length === 0) return { xLabels: [], rows: [] };

	const xProp = getVariantProp(x);
	const xValues = xVariants.map((v) => v.props[xProp]);

	const rows = y.flatMap((yConfig) => {
		const yVariants = resolveVariantConfig(yConfig, propInfos, {});
		if (yVariants.length === 0) return [];
		const yProp = getVariantProp(yConfig);
		return yVariants.map<MatrixRow>((yVariant) => {
			const yValue = yVariant.props[yProp];
			return {
				label: String(yValue),
				cells: xValues.map((xValue) => ({
					label: String(xValue),
					props: { ...baseProps, [xProp]: xValue, [yProp]: yValue },
				})),
			};
		});
	});

	return {
		xLabels: xValues.map(String),
		rows,
	};
}
