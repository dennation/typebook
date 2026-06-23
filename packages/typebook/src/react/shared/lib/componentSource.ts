import type { ComponentType } from "react";

/**
 * Serialize a component + its resolved props into a JSX usage string, e.g.
 * `<Button size="lg">Click me</Button>`. Used by `<Story>` to show its source from the merged
 * props (there is no authored function body to slice, unlike `<Snippet>`).
 *
 * Values are rendered pragmatically: strings as `attr="…"`, booleans as a bare attr (`true`) or
 * `attr={false}`, numbers as `attr={n}`, functions as `attr={fn}`, other objects/arrays via JSON.
 * `children` becomes text content when it's a string/number, otherwise the element self-closes.
 */
export function componentSource(
	component: ComponentType<any>,
	props: Record<string, unknown>,
): string {
	const name = displayName(component);
	const { children, ...rest } = props;

	const attrs = Object.entries(rest)
		.map(([key, value]) => formatAttr(key, value))
		.filter((a): a is string => a !== null);

	const attrStr = attrs.length ? ` ${attrs.join(" ")}` : "";
	const childText = formatChildren(children);

	return childText === null
		? `<${name}${attrStr} />`
		: `<${name}${attrStr}>${childText}</${name}>`;
}

function displayName(component: ComponentType<any>): string {
	return (
		(component as { displayName?: string }).displayName ||
		component.name ||
		"Component"
	);
}

function formatAttr(key: string, value: unknown): string | null {
	if (value === undefined) return null;
	if (value === true) return key;
	if (value === false) return `${key}={false}`;
	if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
	if (typeof value === "number") return `${key}={${value}}`;
	if (typeof value === "function") return `${key}={fn}`;
	return `${key}={${safeStringify(value)}}`;
}

function formatChildren(children: unknown): string | null {
	if (children === null || children === undefined || children === false)
		return null;
	if (typeof children === "string") return children;
	if (typeof children === "number") return String(children);
	return "{/* … */}";
}

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value) ?? "…";
	} catch {
		return "…";
	}
}
