import { NPM_REACT_PACKAGE_NAME } from "../constants.js";
import { type Program, walk } from "./ast.js";

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

		const code = extractChildrenSource(node, opening, content);
		blocks.push({ name, code, start: (node.start as number) ?? 0 });
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
 * Slice the children source between the opening tag's end and the closing tag's
 * start, then strip common indentation and surrounding blank lines. Self-closing
 * `<Snippet name="…" />` has no children and yields an empty string.
 */
function extractChildrenSource(
	element: Record<string, unknown>,
	opening: Record<string, unknown>,
	content: string,
): string {
	const closing = element.closingElement as
		| Record<string, unknown>
		| null
		| undefined;
	if (!closing) return "";

	const start = opening.end as number;
	const end = closing.start as number;
	if (typeof start !== "number" || typeof end !== "number" || end <= start)
		return "";

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
