import ts from "typescript";

/**
 * For each of a component's props, map its name → the source npm package **when it's inherited** —
 * i.e. all its declarations come from one of `inheritedPaths` (framework type packages like
 * `@types/react`). A prop with any first-party declaration is own and absent from the map.
 */
export function inheritedPropSources(
	checker: ts.TypeChecker,
	componentNode: ts.Node,
	inheritedPaths: string[],
): Map<string, string> {
	const sources = new Map<string, string>();

	const type = checker.getTypeAtLocation(componentNode);
	const sig = [
		...type.getCallSignatures(),
		...type.getConstructSignatures(),
	][0];
	const propsParam = sig?.getParameters()[0];
	if (!propsParam) return sources;

	for (const prop of checker.getTypeOfSymbol(propsParam).getProperties()) {
		const from = inheritedSource(prop, inheritedPaths);
		if (from !== null) sources.set(prop.getName(), from);
	}
	return sources;
}

/**
 * The source package of a prop when ALL its declarations are in `inheritedPaths`, else `null`.
 * Props with no declarations (synthetic) are own.
 */
function inheritedSource(
	symbol: ts.Symbol,
	inheritedPaths: string[],
): string | null {
	const declarations = symbol.getDeclarations();
	if (!declarations || declarations.length === 0) return null;

	const allInherited = declarations.every((decl) =>
		inheritedPaths.some((p) => decl.getSourceFile().fileName.includes(p)),
	);
	if (!allInherited) return null;

	return (
		packageFromDeclarationPath(declarations[0].getSourceFile().fileName) ??
		"unknown"
	);
}

/**
 * The npm package a declaration file belongs to, from the last `node_modules/` segment
 * (`…/node_modules/@types/react/index.d.ts` → `@types/react`; scoped packages keep `@scope/name`).
 * `null` when not under node_modules.
 */
export function packageFromDeclarationPath(fileName: string): string | null {
	const marker = "/node_modules/";
	const idx = fileName.lastIndexOf(marker);
	if (idx === -1) return null;
	const parts = fileName.slice(idx + marker.length).split("/");
	if (parts[0].startsWith("@"))
		return parts[1] ? `${parts[0]}/${parts[1]}` : null;
	return parts[0] || null;
}
