import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { PropInfo } from "../../types";
import { TypeScriptClient } from "../ts-client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

let client: TypeScriptClient;

beforeAll(async () => {
	client = new TypeScriptClient(FIXTURES);
	await client.start();
});

afterAll(() => {
	client.stop();
});

/** Props of the named exported component in a fixture file (via the export-based scan). */
async function extractProps(
	componentFile: string,
	name?: string,
): Promise<PropInfo[] | null> {
	const docs = await client.getExportedComponentInfos(
		resolve(FIXTURES, componentFile),
	);
	const doc = name ? docs.find((d) => d.name === name) : docs[0];
	return doc ? doc.props : null;
}

function findProp(props: PropInfo[], name: string): PropInfo | undefined {
	return props.find((p) => p.name === name);
}

// --- Basic types ---

describe("basic types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps("components/Basic.tsx", "Basic"))!;
	});

	test("extracts all 5 props", () => {
		expect(props).toHaveLength(5);
	});

	test("string literal union → literal kind", () => {
		const size = findProp(props, "size")!;
		expect(size.type).toEqual({ kind: "literal", values: ["sm", "md", "lg"] });
		expect(size.optional).toBe(false);
	});

	test("optional string literal union → literal kind + optional", () => {
		const variant = findProp(props, "variant")!;
		expect(variant.type).toEqual({
			kind: "literal",
			values: ["solid", "outline", "ghost"],
		});
		expect(variant.optional).toBe(true);
	});

	test("boolean → boolean kind", () => {
		const disabled = findProp(props, "disabled")!;
		expect(disabled.type).toEqual({ kind: "boolean" });
		expect(disabled.optional).toBe(true);
	});

	test("string → string kind", () => {
		const label = findProp(props, "label")!;
		expect(label.type).toEqual({ kind: "string" });
		expect(label.optional).toBe(false);
	});

	test("number → number kind", () => {
		const count = findProp(props, "count")!;
		expect(count.type).toEqual({ kind: "number" });
		expect(count.optional).toBe(true);
	});
});

// --- React types ---

describe("React types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithChildren.tsx",
			"WithChildren",
		))!;
	});

	test("ReactNode → node kind", () => {
		expect(findProp(props, "children")!.type).toEqual({ kind: "node" });
	});

	test("ReactElement → node kind", () => {
		const icon = findProp(props, "icon")!;
		expect(icon.type).toEqual({ kind: "node" });
		expect(icon.optional).toBe(true);
	});

	test("event handler → function kind", () => {
		expect(findProp(props, "onClick")!.type.kind).toBe("function");
	});

	test("render prop → function kind", () => {
		expect(findProp(props, "renderFooter")!.type.kind).toBe("function");
	});
});

describe("optional props: redundant `| undefined` is stripped", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/OptionalUndefined.tsx",
			"OptionalUndefined",
		))!;
	});

	test("alias union keeps the alias, drops `| undefined`", () => {
		expect(findProp(props, "format")!.type).toEqual({
			kind: "function",
			raw: "Formatter",
		});
	});

	test("nested `| undefined` (a function's return) is preserved", () => {
		expect(findProp(props, "parse")!.type).toEqual({
			kind: "function",
			raw: "(value: string) => string | undefined",
		});
	});

	test("mixed union drops the top-level `| undefined`, keeps members", () => {
		expect(findProp(props, "token")!.type).toEqual({
			kind: "unknown",
			raw: "string | number | (() => void)",
		});
	});

	test("REQUIRED prop keeps `| undefined` (it's a meaningful value there)", () => {
		const prop = findProp(props, "requiredUndefinable")!;
		expect(prop.optional).toBe(false);
		expect(prop.type).toEqual({ kind: "unknown", raw: "string | undefined" });
	});

	test("REQUIRED mixed union keeps `| undefined`", () => {
		expect(findProp(props, "requiredMixed")!.type).toEqual({
			kind: "unknown",
			raw: "string | number | undefined",
		});
	});
});

// --- Generics ---

describe("generics", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps("components/WithGenerics.tsx", "Select"))!;
	});

	test("generic array prop → unknown with raw type", () => {
		const options = findProp(props, "options")!;
		expect(options.type.kind).toBe("unknown");
		expect((options.type as { raw?: string }).raw).toBeDefined();
	});

	test("generic function prop → function", () => {
		expect(findProp(props, "onChange")!.type.kind).toBe("function");
	});

	test("non-generic prop on generic component → string", () => {
		const placeholder = findProp(props, "placeholder")!;
		expect(placeholder.type).toEqual({ kind: "string" });
		expect(placeholder.optional).toBe(true);
	});
});

// --- Inheritance ---

describe("inheritance: extends", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithInheritance.tsx",
			"ExtendedButton",
		))!;
	});

	test("includes base props (id, className)", () => {
		expect(findProp(props, "id")!.type).toEqual({ kind: "string" });
		expect(findProp(props, "className")!.type).toEqual({ kind: "string" });
	});

	test("includes own props (variant, disabled)", () => {
		expect(findProp(props, "variant")!.type).toEqual({
			kind: "literal",
			values: ["primary", "secondary"],
		});
		expect(findProp(props, "disabled")!.type).toEqual({ kind: "boolean" });
	});

	test("has all 4 props total", () => {
		expect(props).toHaveLength(4);
	});
});

describe("group: origin-gated standard classification", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithGroupedAttrs.tsx",
			"WithGroupedAttrs",
		))!;
	});

	test("inherited HTML attrs get their standard group", () => {
		expect(findProp(props, "id")!.group).toBe("global");
		expect(findProp(props, "disabled")!.group).toBe("element");
		expect(findProp(props, "onClick")!.group).toBe("event:mouse");
		expect(findProp(props, "onClickCapture")!.group).toBe("capture");
	});

	test("own props are ungrouped even when the name collides with a standard attribute", () => {
		const size = findProp(props, "size")!;
		expect(size.inheritedFrom).toBeUndefined();
		expect(size.group).toBeUndefined(); // `size` is an HTML attr name, but this one is own
	});

	test("own on* callback is ungrouped (not a DOM event)", () => {
		expect(findProp(props, "onValueChange")!.group).toBeUndefined();
	});
});

describe("inheritedFrom: source package of inherited props", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithHtmlAttrs.tsx",
			"WithHtmlAttrs",
		))!;
	});

	test("own prop has no inheritedFrom", () => {
		expect(findProp(props, "variant")!.inheritedFrom).toBeUndefined();
	});

	test("an HTML-attribute prop is inherited from @types/react", () => {
		expect(findProp(props, "id")!.inheritedFrom).toBe("@types/react");
	});
});

describe("inheritance: intersection", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithInheritance.tsx",
			"IntersectionLink",
		))!;
	});

	test("includes intersection-added props", () => {
		expect(findProp(props, "href")!.type).toEqual({ kind: "string" });
		expect(findProp(props, "target")!.type).toEqual({
			kind: "literal",
			values: ["_blank", "_self"],
		});
	});

	test("has all 4 props total", () => {
		expect(props).toHaveLength(4);
	});
});

// --- Utility types (the component's own type is Pick/Omit/Partial) ---

describe("utility types: Pick", () => {
	test("only includes picked props", async () => {
		const props = (await extractProps(
			"components/WithUtilityTypes.tsx",
			"PickedComponent",
		))!;
		expect(props).toHaveLength(2);
		expect(findProp(props, "a")!.type).toEqual({ kind: "string" });
		expect(findProp(props, "d")!.type).toEqual({
			kind: "literal",
			values: ["x", "y"],
		});
	});
});

describe("utility types: Omit", () => {
	test("excludes omitted props", async () => {
		const props = (await extractProps(
			"components/WithUtilityTypes.tsx",
			"OmittedComponent",
		))!;
		expect(props.map((p) => p.name).sort()).toEqual(["a", "b", "d"]);
		expect(findProp(props, "c")).toBeUndefined();
	});
});

describe("utility types: Partial", () => {
	test("all props become optional", async () => {
		const props = (await extractProps(
			"components/WithUtilityTypes.tsx",
			"PartialComponent",
		))!;
		for (const prop of props) expect(prop.optional).toBe(true);
	});
});

// --- Nullable types ---

describe("nullable types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps("components/WithNullable.tsx", "Nullable"))!;
	});

	test("required `string | null` keeps null", () => {
		expect(findProp(props, "value")!.type).toEqual({
			kind: "unknown",
			raw: "string | null",
		});
	});

	test("optional literal drops `| undefined`, no null present", () => {
		expect(findProp(props, "status")!.type).toEqual({
			kind: "literal",
			values: ["active", "inactive"],
		});
	});

	test("required `number | null | undefined` keeps both", () => {
		expect(findProp(props, "data")!.type).toEqual({
			kind: "unknown",
			raw: "number | null | undefined",
		});
	});

	test("required `boolean | null` keeps null", () => {
		expect(findProp(props, "flag")!.type).toEqual({
			kind: "unknown",
			raw: "boolean | null",
		});
	});
});

// --- Conditional and advanced types ---

describe("conditional and advanced types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithConditionalTypes.tsx",
			"Conditional",
		))!;
	});

	test("template literal type → literal values", () => {
		expect(findProp(props, "sizeLabel")!.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["size-sm", "size-md", "size-lg"]),
		});
	});

	test("enum type → literal values", () => {
		expect(findProp(props, "color")!.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["red", "blue", "green"]),
		});
	});

	test("Extract<> utility → filtered literals", () => {
		expect(findProp(props, "extracted")!.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["a", "b"]),
		});
	});
});

// --- Complex unions ---

describe("complex unions", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithComplexUnions.tsx",
			"ComplexUnion",
		))!;
	});

	test("string | number → unknown with raw type string", () => {
		expect(findProp(props, "mixed")!.type).toEqual({
			kind: "unknown",
			raw: "string | number",
		});
	});

	test("number literal union → number", () => {
		expect(findProp(props, "numLiteral")!.type).toEqual({ kind: "number" });
	});

	test("single string literal → literal with one value", () => {
		expect(findProp(props, "singleLiteral")!.type).toEqual({
			kind: "literal",
			values: ["only"],
		});
	});

	test('"a" | "b" | string → string (wide union absorbs literals)', () => {
		expect(findProp(props, "wide")!.type).toEqual({ kind: "string" });
	});
});

// --- Prop-level JSDoc tags ---

describe("prop JSDoc tags", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps("components/WithJsDoc.tsx", "WithJsDoc"))!;
	});

	test("prose description is extracted", () => {
		expect(findProp(props, "size")!.description).toBe(
			"The visual size of the control.",
		);
	});

	test("@deprecated with text → the tag's text", () => {
		expect(findProp(props, "color")!.deprecated).toBe("use `tone` instead");
	});

	test("bare @deprecated → true", () => {
		expect(findProp(props, "legacy")!.deprecated).toBe(true);
	});

	test("non-deprecated prop → deprecated is undefined", () => {
		expect(findProp(props, "size")!.deprecated).toBeUndefined();
	});
});

// --- Default values ---

describe("default values", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		props = (await extractProps(
			"components/WithDefaults.tsx",
			"WithDefaults",
		))!;
	});

	test("reads param-destructuring defaults as raw source text", () => {
		expect(findProp(props, "size")!.defaultValue).toBe('"md"');
		expect(findProp(props, "count")!.defaultValue).toBe("3");
	});

	test("falls back to the @default JSDoc tag when there's no destructuring default", () => {
		expect(findProp(props, "variant")!.defaultValue).toBe('"solid"');
	});
});

// --- Edge cases ---

describe("edge cases", () => {
	test("component with no props → empty array", async () => {
		expect(await extractProps("components/Empty.tsx", "Empty")).toHaveLength(0);
	});

	test("nonexistent file → null", async () => {
		expect(await extractProps("components/DoesNotExist.tsx")).toBeNull();
	});

	test("edit after start → re-extraction sees new content (no stale host cache)", async () => {
		const compFile = resolve(FIXTURES, "components/_EditProbe.tsx");
		const fresh = new TypeScriptClient(FIXTURES);
		try {
			writeFileSync(
				compFile,
				"export function EditProbe(props: { size: 'sm' | 'md' }) {\n\treturn <div>{props.size}</div>;\n}\n",
			);
			await fresh.start();
			const before = (await fresh.getExportedComponentInfos(compFile))[0].props;
			expect(findProp(before, "size")!.type).toEqual({
				kind: "literal",
				values: ["sm", "md"],
			});

			writeFileSync(
				compFile,
				"export function EditProbe(props: { size: 'sm' | 'md' | 'lg' }) {\n\treturn <div>{props.size}</div>;\n}\n",
			);
			await fresh.notifyChange([compFile]);
			const after = (await fresh.getExportedComponentInfos(compFile))[0].props;
			expect(findProp(after, "size")!.type).toEqual({
				kind: "literal",
				values: ["sm", "md", "lg"],
			});
		} finally {
			rmSync(compFile, { force: true });
			fresh.stop();
		}
	});

	test("file created after start → extracted once notifyChange adds it as a root", async () => {
		const newFile = resolve(FIXTURES, "components/_DynamicallyAdded.tsx");
		const fresh = new TypeScriptClient(FIXTURES);
		await fresh.start(); // captures roots while the file does not exist yet
		try {
			writeFileSync(
				newFile,
				"export function Added(props: { size: 'sm' | 'lg' }) {\n\treturn <div>{props.size}</div>;\n}\n",
			);
			await fresh.notifyChange([newFile]);
			const docs = await fresh.getExportedComponentInfos(newFile);
			expect(findProp(docs[0].props, "size")).toBeDefined();
		} finally {
			rmSync(newFile, { force: true });
			fresh.stop();
		}
	});
});
