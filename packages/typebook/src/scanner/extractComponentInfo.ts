import ts from "typescript";
import type { ComponentInfo, PropInfo } from "../types";
import { classifyPropGroup } from "./classifyPropGroup";
import { declarationName, isReactReturnType } from "./componentDetection";
import { convertType } from "./convertType";
import {
	inheritedPropSources,
	packageFromDeclarationPath,
} from "./inheritedProps";
import {
	symbolDefaultTag,
	symbolDeprecation,
	symbolDescription,
	symbolRemarks,
} from "./jsdoc";
import { paramDefaults } from "./paramDefaults";

/** Turn one module export into a {@link ComponentInfo}, or `null` when it isn't a component. */
export function extractComponentInfo(
	checker: ts.TypeChecker,
	exp: ts.Symbol,
): ComponentInfo | null {
	const resolved =
		exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
	const decl = resolved.getDeclarations()?.[0];
	if (!decl) return null;

	const nameNode = declarationName(decl);
	if (!nameNode) return null;

	const ownPackage = packageFromDeclarationPath(decl.getSourceFile().fileName);
	const props = extractComponentProps(checker, nameNode, ownPackage);
	if (props === null) return null; // not a component

	const info: ComponentInfo = {
		name: exp.getName(),
		file: decl.getSourceFile().fileName,
		props,
	};
	const description = symbolDescription(checker, resolved);
	if (description) info.description = description;
	const remarks = symbolRemarks(checker, resolved);
	if (remarks) info.remarks = remarks;
	const deprecated = symbolDeprecation(checker, resolved);
	if (deprecated !== undefined) info.deprecated = deprecated;
	return info;
}

/**
 * Props of the component identified by its declaration name node, or `null` when the node isn't a
 * component. A component has a call signature returning a React node (function component) or a
 * construct signature (class component); its first parameter is the props type. Each prop is then
 * annotated with its default, `inheritedFrom` package and standard `group` (origin-gated: only
 * framework-inherited attributes get a source + group; a component's own prop stays ungrouped).
 */
function extractComponentProps(
	checker: ts.TypeChecker,
	componentNode: ts.Node,
	ownPackage: string | null,
): PropInfo[] | null {
	const type = checker.getTypeAtLocation(componentNode);
	const callSigs = type.getCallSignatures();
	const constructSigs = type.getConstructSignatures();

	let sig: ts.Signature;
	if (callSigs.length > 0) {
		sig = callSigs[0];
		if (!isReactReturnType(checker, sig.getReturnType())) return null;
	} else if (constructSigs.length > 0) {
		sig = constructSigs[0];
	} else {
		return null;
	}

	const propsParam = sig.getParameters()[0];
	const props = propsParam
		? extractProps(checker, checker.getTypeOfSymbol(propsParam))
		: [];

	const inherited = inheritedPropSources(checker, componentNode, ownPackage);
	const defaults = paramDefaults(checker, componentNode);
	return props.map((p) => {
		let next = p;
		const from = inherited.get(p.name);
		if (from !== undefined) {
			next = { ...next, inheritedFrom: from };
			const group = classifyPropGroup(p.name);
			if (group) next = { ...next, group };
		}
		const def = defaults.get(p.name);
		if (def !== undefined) next = { ...next, defaultValue: def };
		return next;
	});
}

/** Raw {@link PropInfo}s (name, optionality, type, JSDoc description/default/deprecation) of a type. */
function extractProps(checker: ts.TypeChecker, type: ts.Type): PropInfo[] {
	const props: PropInfo[] = [];
	for (const prop of type.getProperties()) {
		// `getTypeOfSymbol` (not declarations) so mapped types like `Pick<T, K>` resolve.
		const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
		const info: PropInfo = {
			name: prop.getName(),
			optional: isOptional,
			type: convertType(checker, checker.getTypeOfSymbol(prop), isOptional),
		};
		const description = symbolDescription(checker, prop);
		if (description) info.description = description;
		const defaultTag = symbolDefaultTag(checker, prop);
		if (defaultTag) info.defaultValue = defaultTag;
		const deprecated = symbolDeprecation(checker, prop);
		if (deprecated !== undefined) info.deprecated = deprecated;
		props.push(info);
	}
	return props;
}
