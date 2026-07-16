import ts from "typescript";

/** The JSDoc description (prose before any `@tag` lines) of a symbol, or `""` when there is none. */
export function symbolDescription(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string {
	const parts = symbol.getDocumentationComment(checker);
	return parts.length === 0 ? "" : ts.displayPartsToString(parts).trim();
}

/** A symbol's `@remarks` tag (usage guidance / do-don't), or `""` when absent. */
export function symbolRemarks(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string {
	return jsDocTagText(checker, symbol, "remarks", "remarks") ?? "";
}

/**
 * A prop's `@default` / `@defaultValue` tag, or `""` when absent. Unlike a parameter-destructuring
 * default, a JSDoc tag survives into emitted `.d.ts`, so it works for components read from a built
 * package.
 */
export function symbolDefaultTag(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string {
	return jsDocTagText(checker, symbol, "default", "defaultValue") ?? "";
}

/**
 * A prop's `@deprecated` tag: its text (a replacement / migration note) when present, `true` for a
 * bare tag, or `undefined` when absent. Survives into emitted `.d.ts`.
 */
export function symbolDeprecation(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
): string | true | undefined {
	const text = jsDocTagText(checker, symbol, "deprecated");
	if (text === undefined) return undefined;
	return text || true;
}

/** The trimmed text of the first matching JSDoc tag on a symbol, or `undefined` when none match. */
function jsDocTagText(
	checker: ts.TypeChecker,
	symbol: ts.Symbol,
	...names: string[]
): string | undefined {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (names.includes(tag.name))
			return ts.displayPartsToString(tag.text).trim();
	}
	return undefined;
}
