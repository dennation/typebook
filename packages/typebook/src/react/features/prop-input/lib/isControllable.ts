import type { PropInfo } from "@/types";

/** Whether an interactive control can be rendered for this prop. */
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
