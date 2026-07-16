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
	if (type.getCallSignatures().length > 0)
		return { kind: "function", raw: typeString };

	if (
		(typeString.includes("ReactNode") || typeString.includes("ReactElement")) &&
		!typeString.endsWith("[]")
	)
		return { kind: "node" };

	return { kind: "unknown", raw: typeString };
}
