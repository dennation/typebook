import type { PropInfo } from "../../types";

/** Render a {@link PropInfo}'s type as a human-readable string (e.g. `"sm" | "md"`). */
export function formatPropType(prop: PropInfo): string {
	const { type } = prop;
	if (type.kind === "literal")
		return type.values.map((v) => `"${v}"`).join(" | ");
	if (type.kind === "unknown" && type.raw) return type.raw;
	if (type.kind === "function" && type.raw) return type.raw;
	if (type.kind === "node") return "ReactNode";
	return type.kind;
}
