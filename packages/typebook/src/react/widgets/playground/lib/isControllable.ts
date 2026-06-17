import type { PropInfo } from "@/types";

/** Whether the Playground can render an interactive control for this prop. */
export function isControllable(prop: PropInfo): boolean {
	const k = prop.type.kind;
	return (
		k === "literal" ||
		k === "boolean" ||
		k === "string" ||
		k === "number" ||
		k === "node"
	);
}
