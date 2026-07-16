import ts from "typescript";

/** The identifier node naming a declaration (function/class/variable), or `null`. */
export function declarationName(decl: ts.Declaration): ts.Node | null {
	const name = (decl as { name?: ts.Node }).name;
	return name && ts.isIdentifier(name) ? name : null;
}

/** Whether a signature return type looks like a rendered React node (the function-component check). */
export function isReactReturnType(
	checker: ts.TypeChecker,
	type: ts.Type,
): boolean {
	return /\b(ReactElement|ReactNode|ReactPortal|JSX\.Element|Element)\b/.test(
		checker.typeToString(type),
	);
}
