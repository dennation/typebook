import type { PropInfo } from "@/types.js";

export function formatPropType(prop: PropInfo): string {
	const { type } = prop;
	if (type.kind === "literal")
		return type.values.map((v) => `"${v}"`).join(" | ");
	if (type.kind === "unknown" && type.raw) return type.raw;
	return type.kind;
}

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
