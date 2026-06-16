import type {
	JSXAttributeValue,
	JSXElement,
	JSXOpeningElement,
} from "oxc-parser";
import { NPM_REACT_PACKAGE_NAME } from "../constants.js";
import { moduleExportName, type Program, walk } from "./ast.js";

/** A single `<Snippet name="…">…</Snippet>` element found in a file */
export interface SnippetBlock {
	/** Value of the required `name` prop — becomes the output file name */
	name: string;
	/** Exact source text of the element's children, sliced 1:1 then dedented */
	code: string;
	/** Character offset of the JSXElement in source — used for stable ordering / diagnostics */
	start: number;
}

const SNIPPET_COMPONENT_NAME = "Snippet";

/**
 * Quick string check before parsing — most files won't reference Snippet at all.
 */
export function mayContainSnippet(content: string): boolean {
	return content.includes(SNIPPET_COMPONENT_NAME);
}

/**
 * Extract every `<Snippet name="…">…</Snippet>` element (whose `Snippet` was imported
 * from `@dennation/typebook/react`) from an already-parsed program.
 *
 * The children are read straight from the original `content` via `code.slice(start, end)`,
 * so the captured text is exactly what the author wrote — no AST re-generation, no
 * formatting drift. Only elements with a static string `name` are kept; anything
 * dynamic can't be resolved at build time.
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

		blocks.push({
			name,
			code: extractChildrenSource(node, content),
			start: node.start,
		});
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
 * Slice the children source between the opening tag's end and the closing tag's
 * start, then strip common indentation and surrounding blank lines. Self-closing
 * `<Snippet name="…" />` has no children and yields an empty string.
 */
function extractChildrenSource(element: JSXElement, content: string): string {
	const closing = element.closingElement;
	if (!closing) return "";

	const start = element.openingElement.end;
	const end = closing.start;
	if (end <= start) return "";

	return dedent(content.slice(start, end));
}

/**
 * Remove surrounding blank lines and the common leading-whitespace shared by all
 * non-blank lines, so extracted JSX reads as if it were authored at column zero.
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
