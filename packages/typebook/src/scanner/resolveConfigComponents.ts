import ts from "typescript";
import type { ComponentSettings } from "../config";
import type { PropGroup } from "../types";

/** A component resolved from a `typebook.config.ts` entry: source location + its literal settings. */
export interface ResolvedConfigComponent {
	file: string;
	name: string;
	settings?: ComponentSettings;
}

/**
 * Statically resolve a `typebook.config.ts`'s `components` list. Reads the default export's (or
 * `defineTypebook(...)`'s) `components` array from the AST and, for each entry — a bare component
 * identifier or `{ component: X, ...settings }` — follows the import to its declaration
 * (`{ file, name }`) and reads its literal settings. The config is parsed, never executed.
 */
export function resolveConfigComponents(
	checker: ts.TypeChecker,
	sourceFile: ts.SourceFile,
): ResolvedConfigComponent[] {
	const array = findComponentsArray(sourceFile);
	if (!array) return [];

	const out: ResolvedConfigComponent[] = [];
	for (const el of array.elements) {
		const idNode = componentIdentifierOf(el);
		if (!idNode) continue;
		const resolved = resolveDeclaration(checker, idNode);
		if (!resolved) continue;
		const settings = readComponentSettings(el);
		out.push(settings ? { ...resolved, settings } : resolved);
	}
	return out;
}

/** Follow an identifier (possibly an import alias) to its declaring source file + export name. */
function resolveDeclaration(
	checker: ts.TypeChecker,
	id: ts.Identifier,
): { file: string; name: string } | null {
	const symbol = checker.getSymbolAtLocation(id);
	if (!symbol) return null;
	const resolved =
		symbol.flags & ts.SymbolFlags.Alias
			? checker.getAliasedSymbol(symbol)
			: symbol;
	const decl = resolved.getDeclarations()?.[0];
	if (!decl) return null;
	return { file: decl.getSourceFile().fileName, name: resolved.getName() };
}

/**
 * The `components: [...]` array of a config's default export, whether written as
 * `export default defineTypebook({ components: [...] })` or `export default { components: [...] }`.
 */
function findComponentsArray(
	sourceFile: ts.SourceFile,
): ts.ArrayLiteralExpression | null {
	const exportAssignment = sourceFile.statements.find(ts.isExportAssignment);
	if (!exportAssignment) return null;

	let expr = exportAssignment.expression;
	if (ts.isCallExpression(expr) && expr.arguments.length > 0)
		expr = expr.arguments[0]; // unwrap defineTypebook(...)
	if (!ts.isObjectLiteralExpression(expr)) return null;

	return propertyValue(expr, "components", ts.isArrayLiteralExpression);
}

/**
 * The component identifier of a `components` entry — the element itself when it's a bare reference
 * (`Button`), or its `component` property when it's an options object (`{ component: Button, … }`).
 */
function componentIdentifierOf(element: ts.Expression): ts.Identifier | null {
	if (ts.isIdentifier(element)) return element;
	if (ts.isObjectLiteralExpression(element))
		return propertyValue(element, "component", ts.isIdentifier);
	return null;
}

/** Read literal `{ omit, pick, hideGroups, importFrom }` settings from a `components` entry object. */
function readComponentSettings(
	element: ts.Expression,
): ComponentSettings | undefined {
	if (!ts.isObjectLiteralExpression(element)) return undefined;
	const settings: ComponentSettings = {};
	const omit = propertyValue(element, "omit", ts.isArrayLiteralExpression);
	const pick = propertyValue(element, "pick", ts.isArrayLiteralExpression);
	const hideGroups = propertyValue(
		element,
		"hideGroups",
		ts.isArrayLiteralExpression,
	);
	const importFrom = propertyValue(element, "importFrom", ts.isStringLiteral);
	if (omit) settings.omit = stringArray(omit) ?? undefined;
	if (pick) settings.pick = stringArray(pick) ?? undefined;
	if (hideGroups) settings.hideGroups = stringArray(hideGroups) as PropGroup[];
	if (importFrom) settings.importFrom = importFrom.text;
	return Object.values(settings).some((v) => v !== undefined)
		? settings
		: undefined;
}

/** The value of an object-literal property named `key`, narrowed by `is`, or `null`. */
function propertyValue<T extends ts.Expression>(
	object: ts.ObjectLiteralExpression,
	key: string,
	is: (node: ts.Node) => node is T,
): T | null {
	for (const prop of object.properties) {
		if (
			ts.isPropertyAssignment(prop) &&
			ts.isIdentifier(prop.name) &&
			prop.name.text === key &&
			is(prop.initializer)
		)
			return prop.initializer;
	}
	return null;
}

/** An array literal of string literals → its values, or `null` when it isn't purely that. */
function stringArray(node: ts.ArrayLiteralExpression): string[] | null {
	const out: string[] = [];
	for (const el of node.elements) {
		if (!ts.isStringLiteral(el)) return null;
		out.push(el.text);
	}
	return out;
}
