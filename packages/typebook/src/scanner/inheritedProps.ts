import ts from "typescript";

/**
 * For each of a component's props, map its name → the source npm package **when it's inherited** —
 * i.e. every declaration comes from a package other than the component's own (`ownPackage`). A prop
 * with any declaration in the component's own package/repo is its own API and absent from the map.
 *
 * `ownPackage` is the component's declaration package (from {@link packageFromDeclarationPath}) or
 * `null` when the component is first-party. This is relative, so it's correct whether the library is
 * the consumer's own source or a prebuilt package in `node_modules`.
 */
export function inheritedPropSources(
	checker: ts.TypeChecker,
	componentNode: ts.Node,
	ownPackage: string | null,
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
		const from = inheritedSource(prop, ownPackage);
		if (from !== null) sources.set(prop.getName(), from);
	}
	return sources;
}

/**
 * The upstream package a prop is inherited from — non-null only when **none** of its declarations
 * live in the component's own package (`ownPackage`). Props with no declarations (synthetic) or with
 * any declaration in the own package are the component's own API → `null`.
 */
function inheritedSource(
	symbol: ts.Symbol,
	ownPackage: string | null,
): string | null {
	const declarations = symbol.getDeclarations();
	if (!declarations || declarations.length === 0) return null;

	const packages = declarations.map((decl) =>
		packageFromDeclarationPath(decl.getSourceFile().fileName),
	);
	if (packages.some((pkg) => pkg === ownPackage)) return null; // an own declaration → own
	return packages[0]; // all upstream → inherited from the declaring package
}

/**
 * The npm package a declaration file belongs to, from the last `node_modules/` segment
 * (`…/node_modules/@types/react/index.d.ts` → `@types/react`; scoped packages keep `@scope/name`).
 * `null` when not under node_modules (a first-party file).
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
