import type {
	ArrowFunctionExpression,
	Expression,
	Function as FunctionNode,
	JSXAttributeValue,
	JSXElement,
	JSXOpeningElement,
} from "oxc-parser";
import { NPM_REACT_PACKAGE_NAME } from "../constants";
import { moduleExportName, type Program, walk } from "./ast";
import { dedent } from "./source-slice";

/**
 * A single `<Snippet>…</Snippet>` element found in a file. Its source comes from one of two places:
 * - an **inline** function child (`{() => …}` or `{function Counter() { … }}`) — its body is sliced
 *   1:1 into `code` (here in the same module, by oxc);
 * - a `source={ref}` prop pointing at a function declared elsewhere (this file or an import) —
 *   recorded as `sourceRef`, resolved+sliced later by the TypeScript client (cross-module).
 *
 * `code` is `null` when the child is *not* an inline function (a bare reference, raw JSX, or
 * nothing) **and** there is no `sourceRef` — the build turns that into a clear error. When a
 * `sourceRef` is present the inline child is ignored (it's the layout render-prop, not the demo).
 */
export interface SnippetBlock {
	/** The inline function body, sliced 1:1 then dedented — or `null` (non-inline child, or `source` ref used). */
	code: string | null;
	/** A `source={ref}` identifier to resolve across modules, or `null` when the demo is inline. */
	sourceRef: SourceRef | null;
	/** Character offset just after the opening tag name, where `__snippetSource` is injected. */
	injectAt: number;
	/** Value of the optional `name` prop, used only for build-error messages. */
	name: string | null;
}

/** A `source={Ident}` reference: the local name and the offset at which the TS client resolves it. */
export interface SourceRef {
	name: string;
	offset: number;
}

const SNIPPET_COMPONENT_NAME = "Snippet";

/**
 * Quick string check before parsing — most files won't reference Snippet at all.
 */
export function mayContainSnippet(content: string): boolean {
	return content.includes(SNIPPET_COMPONENT_NAME);
}

/**
 * Extract every `<Snippet>{fn}</Snippet>` element (whose `Snippet` was imported from
 * `@dennation/typebook/react`) from an already-parsed program. The child must be an inline function
 * component; its body is read straight from the original `content` via `code.slice` — exactly what
 * the author wrote, no AST re-generation. Each block also carries the position at which the build
 * step injects the sliced source as a `__snippetSource` prop.
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

		const sourceRef = sourceRefAttribute(node.openingElement);
		blocks.push({
			// With a `source={ref}` the child is the layout render-prop, not the demo — don't slice it.
			code: sourceRef ? null : childBodySource(node, content),
			sourceRef,
			injectAt: node.openingElement.name.end,
			name: nameAttribute(node.openingElement),
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

/**
 * Read a `source={Ident}` reference: a plain identifier pointing at the example component
 * (declared in this file or imported). Returns its name + character offset so the TypeScript
 * client can resolve the binding and slice its body. Returns null when `source` is absent or
 * isn't a bare identifier (e.g. `source={a.b}` or a literal) — those fall back to the inline child.
 */
function sourceRefAttribute(opening: JSXOpeningElement): SourceRef | null {
	for (const attr of opening.attributes) {
		if (attr.type !== "JSXAttribute") continue;
		if (attr.name.type !== "JSXIdentifier" || attr.name.name !== "source")
			continue;
		const value = attr.value;
		if (
			value?.type === "JSXExpressionContainer" &&
			value.expression.type === "Identifier"
		) {
			return { name: value.expression.name, offset: value.expression.start };
		}
		return null;
	}
	return null;
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
 * the build reports that as an error.
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
	return dedent(content.slice(expr.start, expr.end));
}
