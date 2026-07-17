import ts from "typescript";
import type { PropType } from "../types";

/**
 * Convert a TypeScript type into a {@link PropType} — a literal union, boolean/string/number, a
 * React node, a function (with its rendered signature), or an `unknown` with the raw type string.
 *
 * A top-level `| undefined` is dropped only for OPTIONAL props (TS adds it for the `?` modifier and
 * optionality is already tracked in `PropInfo.optional`); a required `T | undefined` keeps it, and a
 * nested `| undefined` (inside `()`/`<>`/`{}`) is always kept. `| null` is a real value, never
 * dropped.
 */
export function convertType(
	checker: ts.TypeChecker,
	type: ts.Type,
	isOptional: boolean,
): PropType {
	const flags = type.flags;

	let typeString = checker.typeToString(type);
	if (
		isOptional &&
		type.isUnion() &&
		type.types.some((t) => t.flags & ts.TypeFlags.Undefined)
	) {
		typeString = typeString
			.replace(/\s*\|\s*undefined$/, "")
			.replace(/^undefined\s*\|\s*/, "");
	}

	if (flags & ts.TypeFlags.Any) return { kind: "unknown", raw: "any" };

	if (type.isUnion()) {
		const members = type.types.filter(
			(t) => !(isOptional && t.flags & ts.TypeFlags.Undefined),
		);
		if (members.length === 1)
			return convertType(checker, members[0], isOptional);
		if (members.every((t) => t.flags & ts.TypeFlags.StringLiteral))
			return {
				kind: "literal",
				values: members.map((t) => (t as ts.StringLiteralType).value),
			};
		if (members.every((t) => t.flags & ts.TypeFlags.BooleanLiteral))
			return { kind: "boolean" };
		if (members.every((t) => t.flags & ts.TypeFlags.NumberLiteral))
			return { kind: "number" };
	}

	if (flags & ts.TypeFlags.Boolean || flags & ts.TypeFlags.BooleanLiteral)
		return { kind: "boolean" };

	if (flags & ts.TypeFlags.StringLiteral)
		return { kind: "literal", values: [(type as ts.StringLiteralType).value] };
	if (flags & ts.TypeFlags.String) return { kind: "string" };

	if (flags & ts.TypeFlags.Number || flags & ts.TypeFlags.NumberLiteral)
		return { kind: "number" };

	// Keep the signature string so docs show `(e: MouseEvent) => void`, not a bare `function`.
	if (isFunctionType(type)) return { kind: "function", raw: typeString };

	const nodeName = reactNodeName(type);
	if (nodeName) return { kind: "node", name: nodeName };

	return { kind: "unknown", raw: typeString };
}

/** Callable directly, or a `Fn | undefined | null` union whose only meaningful member is callable. */
function isFunctionType(type: ts.Type): boolean {
	if (type.getCallSignatures().length > 0) return true;
	if (!type.isUnion()) return false;
	const meaningful = type.types.filter(
		(t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)),
	);
	return (
		meaningful.length === 1 && meaningful[0].getCallSignatures().length > 0
	);
}

/**
 * The React-node type name (`ReactNode`/`ReactElement`/`ReactPortal`) when the type itself is one,
 * else `undefined`. Checked by the type's (alias) symbol name, not by matching `"ReactNode"` in the
 * rendered string, so a composite that merely *contains* a node (e.g. `Record<string, ReactNode>`,
 * `{ header: ReactNode }`) is not misread as one.
 */
function reactNodeName(
	type: ts.Type,
): "ReactNode" | "ReactElement" | "ReactPortal" | undefined {
	const name = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName();
	return name === "ReactNode" ||
		name === "ReactElement" ||
		name === "ReactPortal"
		? name
		: undefined;
}
