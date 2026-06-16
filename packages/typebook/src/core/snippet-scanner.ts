import { NPM_REACT_PACKAGE_NAME } from "../constants.js";
import { type Program, walk } from "./ast.js";
import { dedent, sliceWithLeadingIndent } from "./dedent.js";

/**
 * A single `<Snippet name="…">{…}</Snippet>` element found in a file. Its child must be a
 * component function — either an inline function/arrow literal (whose body we slice here) or
 * a reference to a component declared elsewhere (whose definition the TypeScript client
 * resolves; the scanner only records where to look).
 */
export type SnippetBlock = {
	/** Value of the required `name` prop — becomes the output map key */
	name: string;
	/** Character offset of the JSXElement in source — used for stable ordering / diagnostics */
	start: number;
} & (
	| {
			/** Inline `{() => …}` / `{function …}`: the function body, sliced 1:1 then dedented */
			kind: "inline";
			code: string;
	  }
	| {
			/** `{SomeComponent}`: a reference the TS client resolves to the component's body */
			kind: "ref";
			/** The referenced identifier's name — diagnostics only */
			ref: string;
			/** Character offset of the identifier — the TS client re-finds the node by offset */
			refOffset: number;
	  }
);

const SNIPPET_COMPONENT_NAME = "Snippet";

/**
 * Quick string check before parsing — most files won't reference Snippet at all.
 */
export function mayContainSnippet(content: string): boolean {
	return content.includes(SNIPPET_COMPONENT_NAME);
}

/**
 * Extract every `<Snippet name="…">{…}</Snippet>` element (whose `Snippet` was imported
 * from `@dennation/typebook/react`) from an already-parsed program.
 *
 * The child must be a component function. For an inline function literal the body is read
 * straight from the original `content` via `code.slice` — exactly what the author wrote, no
 * AST re-generation. For a bare identifier the source lives in another declaration (possibly
 * another file), so only its name/offset is recorded for the TypeScript client to resolve.
 * Only elements with a static string `name` and a recognised function child are kept.
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

		const start = (node.start as number) ?? 0;
		const block = childToBlock(node, name, start, content);
		if (block) blocks.push(block);
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
 * Turn the `<Snippet>`'s child into a block. The child must be a single
 * `{…}` expression container holding a function literal (inline) or an identifier
 * (a component reference). Anything else (raw JSX children, no child) is unsupported
 * under the function-only API and dropped.
 */
function childToBlock(
	element: Record<string, unknown>,
	name: string,
	start: number,
	content: string,
): SnippetBlock | null {
	const children = (element.children as Array<Record<string, unknown>>) ?? [];
	for (const child of children) {
		if (child.type !== "JSXExpressionContainer") continue;
		const expr = child.expression as Record<string, unknown> | undefined;
		if (!expr) continue;

		if (
			expr.type === "ArrowFunctionExpression" ||
			expr.type === "FunctionExpression"
		) {
			return {
				name,
				start,
				kind: "inline",
				code: functionBodySource(expr, content),
			};
		}

		if (expr.type === "Identifier") {
			return {
				name,
				start,
				kind: "ref",
				ref: (expr.name as string) ?? "",
				refOffset: (expr.start as number) ?? 0,
			};
		}
	}
	return null;
}

/**
 * Slice a function literal's body. A block body (`{ … }`) yields its statements (braces
 * stripped); an expression body (`() => <JSX/>`) yields the expression. Dedented so it reads
 * as if authored at column zero.
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
	while (
		expr.type === "ParenthesizedExpression" &&
		expr.expression &&
		typeof expr.expression === "object"
	) {
		expr = expr.expression as Record<string, unknown>;
	}
	return dedent(
		sliceWithLeadingIndent(content, expr.start as number, expr.end as number),
	);
}
