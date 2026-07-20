import path from "node:path";
import ts from "typescript";
import type { ComponentInfo, PropInfo, PropType } from "../types";
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
		dir: path.dirname(sourceFile),
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
	const annotated = props.map((p) => {
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
	// `extractProps` already put the props in a stable declaration order; a final **stable** partition
	// keeps a component's own API first, then inherited props — without disturbing that order within
	// each group. Array.sort is stable, so equal keys retain their declaration-order positions.
	return annotated.sort(
		(a, b) =>
			(a.inheritedFrom === undefined ? 0 : 1) -
			(b.inheritedFrom === undefined ? 0 : 1),
	);
}

/** Raw {@link PropInfo}s (name, optionality, type, JSDoc description/default/deprecation) of a type. */
function extractProps(checker: ts.TypeChecker, type: ts.Type): PropInfo[] {
	const props: PropInfo[] = [];
	for (const prop of orderedProperties(type)) {
		// `getTypeOfSymbol` (not declarations) so mapped types like `Pick<T, K>` resolve.
		const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
		const info: PropInfo = {
			name: prop.getName(),
			optional: isOptional,
			type: stableLiteralOrder(
				convertType(checker, checker.getTypeOfSymbol(prop), isOptional),
				prop,
				checker,
			),
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

// --- Stable ordering ------------------------------------------------------------------------------
// The checker orders both a type's properties and a union's members by internal type/member ids,
// whose order depends on the warm program's cache state and so drifts with the scan order between
// builds — reshuffling props and their allowed values in the generated docs for no real change. Both
// are pinned to the authored source order below, so the same input always produces the same output.

/**
 * A type's properties ordered by where they're declared, instead of by `Type.getProperties()`'s
 * cache-dependent order. Own props (declared with the component) stay ahead of inherited ones, and
 * the order is identical on every build.
 */
function orderedProperties(type: ts.Type): ts.Symbol[] {
	return [...type.getProperties()].sort(byDeclarationSite);
}

/** A location in the source: a file and a position within it. */
interface SourceLocation {
	file: string;
	pos: number;
}

/**
 * Sort two symbols by declaration site: earliest file, then position within it. A symbol with no
 * declaration (synthetic) sorts after one that has a declaration; two synthetic symbols sort by name.
 */
function byDeclarationSite(a: ts.Symbol, b: ts.Symbol): number {
	const locationA = declarationLocation(a);
	const locationB = declarationLocation(b);
	if (locationA && locationB) return compareLocations(locationA, locationB);
	if (locationA) return -1;
	if (locationB) return 1;
	return compareStrings(a.getName(), b.getName());
}

/** Where a symbol is first declared, or `null` when it has no declaration. */
function declarationLocation(symbol: ts.Symbol): SourceLocation | null {
	const locations: SourceLocation[] = (symbol.getDeclarations() ?? []).map(
		(declaration) => ({
			file: declaration.getSourceFile().fileName,
			pos: declaration.pos,
		}),
	);
	return locations.sort(compareLocations)[0] ?? null;
}

function compareLocations(a: SourceLocation, b: SourceLocation): number {
	return compareStrings(a.file, b.file) || a.pos - b.pos;
}

/**
 * A literal union's values ordered to be stable across builds. Values written in an inline
 * `"a" | "b"` union keep that authored source order; anything else — derived unions
 * (`Extract`/`Exclude`), template-literal and enum unions, which have no source order to read —
 * falls back to alphabetical, which is at least deterministic. Non-literal types pass through.
 */
function stableLiteralOrder(
	type: PropType,
	prop: ts.Symbol,
	checker: ts.TypeChecker,
): PropType {
	if (type.kind !== "literal" || type.values.length < 2) return type;

	const authored = authoredUnionOrder(prop, checker);
	// Authored values first, in their source order; values not found there (e.g. derived unions)
	// come after, ordered alphabetically among themselves.
	const authoredIndex = (value: string): number => {
		const index = authored.indexOf(value);
		return index === -1 ? authored.length : index;
	};
	const values = [...type.values].sort(
		(a, b) => authoredIndex(a) - authoredIndex(b) || compareStrings(a, b),
	);
	return { ...type, values };
}

/**
 * The string-literal members of a prop's union in authored source order, or `[]` when the prop isn't
 * written as an inline `"a" | "b"` union. A named `type Size = "a" | "b"` alias is followed once.
 */
function authoredUnionOrder(
	prop: ts.Symbol,
	checker: ts.TypeChecker,
): string[] {
	for (const declaration of prop.getDeclarations() ?? []) {
		let typeNode = (declaration as { type?: ts.TypeNode }).type;
		if (typeNode && ts.isTypeReferenceNode(typeNode))
			typeNode = resolveTypeAlias(typeNode, checker) ?? typeNode;
		if (typeNode && ts.isUnionTypeNode(typeNode)) {
			const literals = stringLiterals(typeNode);
			if (literals.length > 0) return literals;
		}
	}
	return [];
}

/** The type a `Size`-style reference points to, or `null` when it isn't a resolvable type alias. */
function resolveTypeAlias(
	reference: ts.TypeReferenceNode,
	checker: ts.TypeChecker,
): ts.TypeNode | null {
	const symbol = checker.getSymbolAtLocation(reference.typeName);
	const target =
		symbol && symbol.flags & ts.SymbolFlags.Alias
			? checker.getAliasedSymbol(symbol)
			: symbol;
	const alias = target?.getDeclarations()?.find(ts.isTypeAliasDeclaration);
	return alias?.type ?? null;
}

/** The text of every string-literal member of a union, in source order. */
function stringLiterals(union: ts.UnionTypeNode): string[] {
	const texts: string[] = [];
	for (const member of union.types) {
		if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal))
			texts.push(member.literal.text);
	}
	return texts;
}

/** Locale-independent string order (code-unit), so the result is identical on every machine. */
function compareStrings(a: string, b: string): number {
	return a < b ? -1 : a > b ? 1 : 0;
}
