import type { ReactNode } from "react";

/** Safely extract plain text from React children (handles nested elements). */
export function childText(node: ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(childText).join("");
	if (typeof node === "object" && "props" in node) {
		const props = (node as { props?: { children?: ReactNode } }).props;
		if (props && props.children !== undefined) return childText(props.children);
	}
	return "";
}
