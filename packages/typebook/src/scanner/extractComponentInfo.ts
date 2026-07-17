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

/**
 * Turn one module export into a {@link ComponentInfo}, or `null` when it isn't a component.
 * `sourceFile` is the scanned module the export was found in (the glob-matched file), distinct from
 * the component's own declaration `file` when the export is a re-export.
 */
export function extractComponentInfo(
	checker: ts.TypeChecker,
	exp: ts.Symbol,
	sourceFile: string,
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
		sourceFile,
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
 * component. Only **function components** are recognised — a call signature returning a React node,
 * whose first parameter is the props type (class components are not supported). Each prop is then
 * annotated with its default, standard `group` (by name — own props too) and, for props that come
 * from framework/base types, an `inheritedFrom` package (the own/inherited signal).
 */
function extractComponentProps(
	checker: ts.TypeChecker,
	componentNode: ts.Node,
	ownPackage: string | null,
): PropInfo[] | null {
	const type = checker.getTypeAtLocation(componentNode);
	const sig = type.getCallSignatures()[0];
	if (!sig || !isReactReturnType(checker, sig.getReturnType())) return null;

	const propsParam = sig.getParameters()[0];
	const props = propsParam
		? extractProps(checker, checker.getTypeOfSymbol(propsParam))
		: [];

	const inherited = inheritedPropSources(checker, componentNode, ownPackage);
	const defaults = paramDefaults(checker, componentNode);
	return props.map((p) => {
		let next = p;
		const from = inherited.get(p.name);
		if (from !== undefined) next = { ...next, inheritedFrom: from };
		// Classify the group for every prop — own props too, so `keepOwnProps: false` can filter
		// them by group. `inheritedFrom` (set above, inherited only) stays the own/inherited signal.
		const group = classifyPropGroup(p.name);
		if (group) next = { ...next, group };
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
