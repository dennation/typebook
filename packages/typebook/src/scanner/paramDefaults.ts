import ts from "typescript";

/**
 * Default values from a component's first-parameter object destructuring (e.g.
 * `function Btn({ size = 'md' })`) → a `propName → initializer source text` map. Only destructuring
 * in the parameter list is read; defaults applied in the function body are ignored.
 */
export function paramDefaults(
	checker: ts.TypeChecker,
	componentNode: ts.Node,
): Map<string, string> {
	const defaults = new Map<string, string>();

	const symbol = checker.getSymbolAtLocation(componentNode);
	if (!symbol) return defaults;
	const resolved =
		symbol.flags & ts.SymbolFlags.Alias
			? checker.getAliasedSymbol(symbol)
			: symbol;

	for (const decl of resolved.getDeclarations() ?? []) {
		const fn = functionLikeOf(decl);
		const firstParam = fn?.parameters[0];
		if (!firstParam) continue;
		collectBindingDefaults(firstParam.name, defaults);
		if (defaults.size > 0) break;
	}
	return defaults;
}

/**
 * The function-like node whose parameters to inspect. Unwraps a `const X = …` initializer and, for a
 * wrapped component (`forwardRef(fn)`, `memo(fn)`, `memo(forwardRef(fn))`), recurses through the call
 * to its first function argument — that render function holds the destructured props.
 */
function functionLikeOf(node: ts.Node): ts.SignatureDeclaration | null {
	if (
		ts.isFunctionDeclaration(node) ||
		ts.isFunctionExpression(node) ||
		ts.isArrowFunction(node)
	)
		return node;
	if (ts.isVariableDeclaration(node) && node.initializer)
		return functionLikeOf(node.initializer);
	if (ts.isCallExpression(node))
		for (const arg of node.arguments) {
			const fn = functionLikeOf(arg);
			if (fn) return fn;
		}
	return null;
}

/** Record `propName → initializer text` for each top-level destructured param with a default. */
function collectBindingDefaults(
	name: ts.BindingName,
	out: Map<string, string>,
): void {
	if (!ts.isObjectBindingPattern(name)) return;
	for (const element of name.elements) {
		if (!element.initializer) continue;
		const propName = element.propertyName ?? element.name;
		if (ts.isIdentifier(propName))
			out.set(propName.text, element.initializer.getText());
	}
}
