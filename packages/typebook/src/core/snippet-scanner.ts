import type {
	ArrowFunctionExpression,
	Expression,
	Function as FunctionNode,
	JSXAttributeValue,
	JSXElement,
	JSXOpeningElement,
} from "oxc-parser";
import { NPM_REACT_PACKAGE_NAME } from "../constants.js";
import { moduleExportName, type Program, walk } from "./ast.js";

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
	const snippetLocalNames = collectSnippetNames(program);
	if (snippetLocalNames.size === 0) return [];

	const blocks: SnippetBlock[] = [];
	walk(program, (node) => {
		if (node.type !== "JSXElement") return;
		if (!isSnippetTag(node.openingElement, snippetLocalNames)) return;

		const name = nameAttribute(node.openingElement);
		if (name === null) return;

		blocks.push({ name, code: childBodySource(node, content) });
	});

	return blocks;
}

/**
 * Collect local names bound to `Snippet` from `@dennation/typebook/react`.
 * Handles aliasing: `import { Snippet as Code } from '…/react'` adds 'Code'.
 */
function collectSnippetNames(program: Program): Set<string> {
	const names = new Set<string>();
	for (const node of program.body) {
		if (node.type !== "ImportDeclaration") continue;
		if (node.source.value !== NPM_REACT_PACKAGE_NAME) continue;
		for (const spec of node.specifiers) {
			if (spec.type !== "ImportSpecifier") continue;
			if (moduleExportName(spec.imported) === SNIPPET_COMPONENT_NAME) {
				names.add(spec.local.name);
			}
		}
	}
	return names;
}

function isSnippetTag(
	opening: JSXOpeningElement,
	snippetLocalNames: Set<string>,
): boolean {
	return (
		opening.name.type === "JSXIdentifier" &&
		snippetLocalNames.has(opening.name.name)
	);
}

/** Read the static string value of the `name` attribute, or null if absent/dynamic. */
function nameAttribute(opening: JSXOpeningElement): string | null {
	for (const attr of opening.attributes) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name.type !== "JSXIdentifier" || attr.name.name !== "name")
			continue;
		return staticStringValue(attr.value);
	}
	return null;
}

/** Resolve `name="x"` (Literal) and `name={'x'}` (JSXExpressionContainer → Literal). */
function staticStringValue(value: JSXAttributeValue | null): string | null {
	if (!value) return null;
	if (value.type === "Literal" && typeof value.value === "string")
		return value.value;
	if (value.type === "JSXExpressionContainer") {
		const expr = value.expression;
		if (expr.type === "Literal" && typeof expr.value === "string")
			return expr.value;
	}
	return null;
}

/**
 * The child must be a single `{…}` expression container holding an inline function. Returns its
 * body source, or `null` for any other child (a bare identifier reference, raw JSX, or nothing) —
 * the builder reports that as a build error.
 */
function childBodySource(element: JSXElement, content: string): string | null {
	for (const child of element.children) {
		if (child.type !== "JSXExpressionContainer") continue;
		const expr = child.expression;
		if (
			expr.type === "ArrowFunctionExpression" ||
			expr.type === "FunctionExpression"
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
	fn: ArrowFunctionExpression | FunctionNode,
	content: string,
): string {
	const body = fn.body;
	if (!body) return "";

	if (body.type === "BlockStatement") {
		// Strip the wrapping braces, keep the statements (incl. `return`).
		return dedent(content.slice(body.start + 1, body.end - 1));
	}

	// Expression body: unwrap `() => ( … )` parens so the shown source is just the expression.
	let expr: Expression = body;
	while (expr.type === "ParenthesizedExpression") {
		expr = expr.expression;
	}
	return dedent(sliceWithLeadingIndent(content, expr.start, expr.end));
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
