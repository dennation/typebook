import { NPM_REACT_PACKAGE_NAME } from "../constants.js";
import { type Program, walk } from "./ast.js";

/**
 * A single `<Snippet name="…">{fn}</Snippet>` element found in a file. Its child must be an inline
 * function component (`{() => …}` or `{function Counter() { … }}`), whose body we slice as the
 * shown source. `code` is `null` when the child is *not* an inline function (a bare reference, raw
 * JSX, or nothing) — the builder turns that into a clear build error rather than a silent drop.
 */
export interface SnippetBlock {
	/** Value of the required `name` prop — becomes the output map key */
	name: string;
	/** The function body, sliced 1:1 then dedented — or `null` when the child isn't an inline function */
	code: string | null;
}

const SNIPPET_COMPONENT_NAME = "Snippet";

/**
 * Quick string check before parsing — most files won't reference Snippet at all.
 */
export function mayContainSnippet(content: string): boolean {
	return content.includes(SNIPPET_COMPONENT_NAME);
}

/**
 * Extract every `<Snippet name="…">{fn}</Snippet>` element (whose `Snippet` was imported from
 * `@dennation/typebook/react`) from an already-parsed program. The child must be an inline function
 * component; its body is read straight from the original `content` via `code.slice` — exactly what
 * the author wrote, no AST re-generation. Only elements with a static string `name` are kept.
 */
export function scanSnippets(
	program: Program,
	content: string,
): SnippetBlock[] {
	const body = (program as { body: unknown[] }).body;

	const snippetLocalNames = collectSnippetNames(
		body as Array<Record<string, unknown>>,
	);
	if (snippetLocalNames.size === 0) return [];

	const blocks: SnippetBlock[] = [];
	walk(program, (node) => {
		if (node.type !== "JSXElement") return;

		const opening = node.openingElement as Record<string, unknown> | undefined;
		if (!opening || !isSnippetTag(opening, snippetLocalNames)) return;

		const name = nameAttribute(opening);
		if (name === null) return;

		blocks.push({ name, code: childBodySource(node, content) });
	});

	return blocks;
}

/**
 * Collect local names bound to `Snippet` from `@dennation/typebook/react`.
 * Handles aliasing: `import { Snippet as Code } from '…/react'` adds 'Code'.
 */
function collectSnippetNames(
	body: Array<Record<string, unknown>>,
): Set<string> {
	const names = new Set<string>();
	for (const node of body) {
		if (node.type !== "ImportDeclaration") continue;
		if (
			(node.source as { value?: string } | undefined)?.value !==
			NPM_REACT_PACKAGE_NAME
		)
			continue;

		const specifiers =
			(node.specifiers as Array<Record<string, unknown>>) ?? [];
		for (const spec of specifiers) {
			if (spec.type !== "ImportSpecifier") continue;
			if (
				(spec.imported as { name?: string } | undefined)?.name !==
				SNIPPET_COMPONENT_NAME
			)
				continue;
			const localName = (spec.local as { name?: string } | undefined)?.name;
			if (localName) names.add(localName);
		}
	}
	return names;
}

function isSnippetTag(
	opening: Record<string, unknown>,
	snippetLocalNames: Set<string>,
): boolean {
	const name = opening.name as { type?: string; name?: string } | undefined;
	return (
		name?.type === "JSXIdentifier" &&
		!!name.name &&
		snippetLocalNames.has(name.name)
	);
}

/** Read the static string value of the `name` attribute, or null if absent/dynamic. */
function nameAttribute(opening: Record<string, unknown>): string | null {
	const attributes =
		(opening.attributes as Array<Record<string, unknown>>) ?? [];
	for (const attr of attributes) {
		if (attr.type !== "JSXAttribute") continue;
		if ((attr.name as { name?: string } | undefined)?.name !== "name") continue;
		return staticStringValue(
			attr.value as Record<string, unknown> | null | undefined,
		);
	}
	return null;
}

/** Resolve `name="x"` (Literal) and `name={'x'}` (JSXExpressionContainer → Literal). */
function staticStringValue(
	value: Record<string, unknown> | null | undefined,
): string | null {
	if (!value) return null;
	if (value.type === "Literal" && typeof value.value === "string")
		return value.value;
	if (value.type === "JSXExpressionContainer") {
		return staticStringValue(value.expression as Record<string, unknown>);
	}
	return null;
}

/**
 * The child must be a single `{…}` expression container holding an inline function. Returns its
 * body source, or `null` for any other child (a bare identifier reference, raw JSX, or nothing) —
 * the builder reports that as a build error.
 */
function childBodySource(
	element: Record<string, unknown>,
	content: string,
): string | null {
	const children = (element.children as Array<Record<string, unknown>>) ?? [];
	for (const child of children) {
		if (child.type !== "JSXExpressionContainer") continue;
		const expr = child.expression as Record<string, unknown> | undefined;
		if (
			expr?.type === "ArrowFunctionExpression" ||
			expr?.type === "FunctionExpression"
		) {
			return functionBodySource(expr, content);
		}
	}
	return null;
}

/**
 * Slice a function literal's body. A block body (`{ … }`) yields its statements (braces stripped);
 * an expression body (`() => <JSX/>`) yields the expression (parens unwrapped). Dedented so it
 * reads as if authored at column zero.
 */
function functionBodySource(
	fn: Record<string, unknown>,
	content: string,
): string {
	const body = fn.body as Record<string, unknown> | undefined;
	if (!body) return "";

	const bodyStart = body.start as number;
	const bodyEnd = body.end as number;
	if (typeof bodyStart !== "number" || typeof bodyEnd !== "number") return "";

	if (body.type === "BlockStatement") {
		// Strip the wrapping braces, keep the statements (incl. `return`).
		return dedent(content.slice(bodyStart + 1, bodyEnd - 1));
	}

	// Expression body: unwrap `() => ( … )` parens so the shown source is just the expression.
	let expr = body;
	while (expr.type === "ParenthesizedExpression") {
		expr = expr.expression as Record<string, unknown>;
	}
	return dedent(
		sliceWithLeadingIndent(content, expr.start as number, expr.end as number),
	);
}

/**
 * Slice `[start, end)` but, when the slice begins at the first non-whitespace token of its line,
 * extend the start back to the line's indentation. This gives {@link dedent} a uniform block: an
 * expression body like `() => (\n  <div/>\n)` otherwise starts mid-line with the first line at
 * column zero and the rest indented, defeating the common-indent calculation.
 */
function sliceWithLeadingIndent(
	text: string,
	start: number,
	end: number,
): string {
	const lineStart = text.lastIndexOf("\n", start - 1) + 1;
	const from = text.slice(lineStart, start).trim() === "" ? lineStart : start;
	return text.slice(from, end);
}

/**
 * Remove surrounding blank lines and the common leading-whitespace shared by all non-blank lines,
 * so extracted source reads as if it were authored at column zero.
 */
function dedent(source: string): string {
	const lines = source.replace(/\t/g, "  ").split("\n");

	while (lines.length > 0 && lines[0].trim() === "") lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
	if (lines.length === 0) return "";

	let min = Infinity;
	for (const line of lines) {
		if (line.trim() === "") continue;
		const indent = line.length - line.trimStart().length;
		if (indent < min) min = indent;
	}
	if (!Number.isFinite(min) || min === 0) return lines.join("\n");

	return lines.map((line) => line.slice(min)).join("\n");
}
