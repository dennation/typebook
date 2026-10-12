import ts from "typescript";
import { compareStrings } from "./compareStrings";

// `typeToString`'s default node-builder flags, plus `NoTruncation`: the checker elides a long union's
// middle members in its own type-id order, which no later sorting can undo.
const BUILDER_FLAGS =
	ts.NodeBuilderFlags.AllowUniqueESSymbolType |
	ts.NodeBuilderFlags.UseAliasDefinedOutsideCurrentScope |
	ts.NodeBuilderFlags.IgnoreErrors |
	ts.NodeBuilderFlags.NoTruncation;

const printer = ts.createPrinter({ removeComments: true });
const emptyFile = ts.createSourceFile("", "", ts.ScriptTarget.Latest);

/**
 * Render a type like `checker.typeToString`, but identically on every build. The checker orders
 * union members by type id — creation order — so scanning an unrelated component first could flip
 * `"a" | "b"` inside an `Omit<…>`; here every union, at any depth, is ordered by its members' text.
 * With `dropUndefined`, a top-level `undefined` member is removed (an optional prop's, redundant
 * with `PropInfo.optional`); a nested one is always kept.
 */
export function printType(
	checker: ts.TypeChecker,
	type: ts.Type,
	dropUndefined: boolean,
): string {
	const node = checker.typeToTypeNode(type, undefined, BUILDER_FLAGS);
	if (!node) return checker.typeToString(type);
	const result = ts.transform(dropUndefined ? withoutUndefined(node) : node, [
		sortUnions,
	]);
	const text = print(result.transformed[0]);
	result.dispose();
	return text;
}

function print(node: ts.Node): string {
	return printer.printNode(ts.EmitHint.Unspecified, node, emptyFile);
}

/** The node without its top-level `undefined` union member. */
function withoutUndefined(node: ts.TypeNode): ts.TypeNode {
	if (!ts.isUnionTypeNode(node)) return node;
	const types = node.types.filter(
		(t) => t.kind !== ts.SyntaxKind.UndefinedKeyword,
	);
	return types.length === 1
		? types[0]
		: ts.factory.updateUnionTypeNode(node, ts.factory.createNodeArray(types));
}

/** Order every union's members, at any depth, by {@link sortUnion}. */
const sortUnions: ts.TransformerFactory<ts.TypeNode> = (context) => {
	const visit = (node: ts.Node): ts.Node => {
		const visited = ts.visitEachChild(node, visit, context);
		return ts.isUnionTypeNode(visited) ? sortUnion(visited) : visited;
	};
	return (root) => ts.visitNode(root, visit, ts.isTypeNode);
};

/**
 * A union with its members sorted by printed text. Intrinsics (`string`, `undefined`, `null`, …) keep
 * their slots: their ids are fixed when the checker is created, so they're already placed the same
 * on every build, and `string | number | undefined` stays as TypeScript writes it.
 */
function sortUnion(union: ts.UnionTypeNode): ts.UnionTypeNode {
	const sorted = union.types
		.filter((t) => !isIntrinsic(t))
		.map((t) => ({ t, text: print(t) }))
		.sort((a, b) => compareStrings(a.text, b.text));
	let next = 0;
	const types = union.types.map((t) => (isIntrinsic(t) ? t : sorted[next++].t));
	return ts.factory.updateUnionTypeNode(
		union,
		ts.factory.createNodeArray(types),
	);
}

/** A keyword type (`string`, `undefined`, …) or a `null`/`true`/`false` literal type. */
function isIntrinsic(node: ts.TypeNode): boolean {
	const kind = ts.isLiteralTypeNode(node) ? node.literal.kind : node.kind;
	return (
		kind >= ts.SyntaxKind.FirstKeyword && kind <= ts.SyntaxKind.LastKeyword
	);
}
