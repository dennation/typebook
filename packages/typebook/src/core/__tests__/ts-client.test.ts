import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { PropInfo } from "../../types";
import { parseProgram } from "../ast";
import { scanMetaCalls } from "../meta-scanner";
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

async function extractProps(storyFile: string): Promise<PropInfo[] | null> {
	const filePath = resolve(FIXTURES, storyFile);
	let content: string;
	try {
		content = readFileSync(filePath, "utf-8");
	} catch {
		// Let the client handle nonexistent files for that test
		return client.getProps(filePath, 0);
	}
	const calls = scanMetaCalls(await parseProgram(filePath, content));
	if (calls.length === 0) return null;
	return client.getProps(filePath, calls[0].callStart);
}

function findProp(props: PropInfo[], name: string): PropInfo | undefined {
	return props.find((p) => p.name === name);
}

// --- Basic types ---

describe("basic types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps("stories/Basic.stories.tsx");
		expect(result).not.toBeNull();
		props = result!;
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

// --- Props filter ---

describe("props filter", () => {
	test("returns only filtered props when props array provided", async () => {
		const props = await extractProps("stories/BasicFiltered.stories.tsx");
		expect(props).not.toBeNull();
		expect(props!).toHaveLength(2);

		const names = props!.map((p) => p.name).sort();
		expect(names).toEqual(["disabled", "size"]);
	});
});

// --- React types ---

describe("React types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps("stories/WithChildren.stories.tsx");
		expect(result).not.toBeNull();
		props = result!;
	});

	test("ReactNode → node kind", () => {
		const children = findProp(props, "children")!;
		expect(children.type).toEqual({ kind: "node" });
	});

	test("ReactElement → node kind", () => {
		const icon = findProp(props, "icon")!;
		expect(icon.type).toEqual({ kind: "node" });
		expect(icon.optional).toBe(true);
	});

	test("event handler → function kind", () => {
		const onClick = findProp(props, "onClick")!;
		expect(onClick.type.kind).toBe("function");
		expect(onClick.optional).toBe(true);
	});

	test("render prop → function kind", () => {
		const renderFooter = findProp(props, "renderFooter")!;
		expect(renderFooter.type.kind).toBe("function");
		expect(renderFooter.optional).toBe(true);
	});
});

// --- Generics ---

describe("generics", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps("stories/WithGenerics.stories.tsx");
		expect(result).not.toBeNull();
		props = result!;
	});

	test('instantiated generic value prop: Select<"alpha" | "beta" | "gamma">', () => {
		const value = findProp(props, "value")!;
		expect(value.type).toEqual({
			kind: "literal",
			values: ["alpha", "beta", "gamma"],
		});
	});

	test("generic array prop → unknown with raw type (T[] not yet handled)", () => {
		const options = findProp(props, "options")!;
		expect(options.type.kind).toBe("unknown");
		expect((options.type as any).raw).toBeDefined();
	});

	test("generic function prop → function", () => {
		const onChange = findProp(props, "onChange")!;
		expect(onChange.type.kind).toBe("function");
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
		const result = await extractProps(
			"stories/WithInheritanceExtends.stories.tsx",
		);
		expect(result).not.toBeNull();
		props = result!;
	});

	test("includes base props (id, className)", () => {
		const id = findProp(props, "id")!;
		expect(id.type).toEqual({ kind: "string" });
		expect(id.optional).toBe(false);

		const className = findProp(props, "className")!;
		expect(className.type).toEqual({ kind: "string" });
		expect(className.optional).toBe(true);
	});

	test("includes own props (variant, disabled)", () => {
		const variant = findProp(props, "variant")!;
		expect(variant.type).toEqual({
			kind: "literal",
			values: ["primary", "secondary"],
		});

		const disabled = findProp(props, "disabled")!;
		expect(disabled.type).toEqual({ kind: "boolean" });
	});

	test("has all 4 props total", () => {
		expect(props).toHaveLength(4);
	});
});

describe("inheritance: intersection", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps(
			"stories/WithInheritanceIntersection.stories.tsx",
		);
		expect(result).not.toBeNull();
		props = result!;
	});

	test("includes base props from intersection", () => {
		const id = findProp(props, "id")!;
		expect(id.type).toEqual({ kind: "string" });

		const className = findProp(props, "className")!;
		expect(className.type).toEqual({ kind: "string" });
	});

	test("includes intersection-added props", () => {
		const href = findProp(props, "href")!;
		expect(href.type).toEqual({ kind: "string" });
		expect(href.optional).toBe(false);

		const target = findProp(props, "target")!;
		expect(target.type).toEqual({
			kind: "literal",
			values: ["_blank", "_self"],
		});
		expect(target.optional).toBe(true);
	});

	test("has all 4 props total", () => {
		expect(props).toHaveLength(4);
	});
});

// --- Utility types ---

describe("utility types: Pick", () => {
	test("only includes picked props", async () => {
		const props = await extractProps("stories/WithUtilityPick.stories.tsx");
		expect(props).not.toBeNull();
		expect(props!).toHaveLength(2);

		const a = findProp(props!, "a")!;
		expect(a.type).toEqual({ kind: "string" });

		const d = findProp(props!, "d")!;
		expect(d.type).toEqual({ kind: "literal", values: ["x", "y"] });
		expect(d.optional).toBe(true);
	});
});

describe("utility types: Omit", () => {
	test("excludes omitted props", async () => {
		const props = await extractProps("stories/WithUtilityOmit.stories.tsx");
		expect(props).not.toBeNull();

		const names = props!.map((p) => p.name).sort();
		expect(names).toEqual(["a", "b", "d"]);
		// 'c' (boolean) should NOT be present — it was omitted
		expect(findProp(props!, "c")).toBeUndefined();
	});
});

describe("utility types: Partial", () => {
	test("all props become optional", async () => {
		const props = await extractProps("stories/WithUtilityPartial.stories.tsx");
		expect(props).not.toBeNull();

		for (const prop of props!) {
			expect(prop.optional).toBe(true);
		}
	});
});

// --- Nullable types ---

describe("nullable types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps("stories/WithNullable.stories.tsx");
		expect(result).not.toBeNull();
		props = result!;
	});

	test("string | null → string (null filtered)", () => {
		const value = findProp(props, "value")!;
		expect(value.type).toEqual({ kind: "string" });
	});

	test("literal | undefined → literal (undefined filtered)", () => {
		const status = findProp(props, "status")!;
		expect(status.type).toEqual({
			kind: "literal",
			values: ["active", "inactive"],
		});
	});

	test("number | null | undefined → number", () => {
		const data = findProp(props, "data")!;
		expect(data.type).toEqual({ kind: "number" });
	});

	test("boolean | null → boolean", () => {
		const flag = findProp(props, "flag")!;
		expect(flag.type).toEqual({ kind: "boolean" });
	});
});

// --- Conditional and advanced types ---

describe("conditional and advanced types", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps(
			"stories/WithConditionalTypes.stories.tsx",
		);
		expect(result).not.toBeNull();
		props = result!;
	});

	test("template literal type: `size-${Size}` → literal values", () => {
		const sizeLabel = findProp(props, "sizeLabel")!;
		expect(sizeLabel.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["size-sm", "size-md", "size-lg"]),
		});
		expect((sizeLabel.type as any).values).toHaveLength(3);
	});

	test("enum type → literal values", () => {
		const color = findProp(props, "color")!;
		expect(color.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["red", "blue", "green"]),
		});
		expect((color.type as any).values).toHaveLength(3);
	});

	test("Extract<> utility → filtered literals", () => {
		const extracted = findProp(props, "extracted")!;
		expect(extracted.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["a", "b"]),
		});
		expect((extracted.type as any).values).toHaveLength(2);
	});

	test("Exclude<> utility → remaining literals", () => {
		const excluded = findProp(props, "excluded")!;
		expect(excluded.type).toEqual({
			kind: "literal",
			values: expect.arrayContaining(["a", "b"]),
		});
		expect((excluded.type as any).values).toHaveLength(2);
	});
});

// --- Complex unions ---

describe("complex unions", () => {
	let props: PropInfo[];

	beforeAll(async () => {
		const result = await extractProps("stories/WithComplexUnions.stories.tsx");
		expect(result).not.toBeNull();
		props = result!;
	});

	test("string | number → unknown with raw type string", () => {
		const mixed = findProp(props, "mixed")!;
		expect(mixed.type).toEqual({ kind: "unknown", raw: "string | number" });
	});

	test("number literal union 1 | 2 | 3 → number", () => {
		const numLiteral = findProp(props, "numLiteral")!;
		expect(numLiteral.type).toEqual({ kind: "number" });
	});

	test("single string literal → literal with one value", () => {
		const single = findProp(props, "singleLiteral")!;
		expect(single.type).toEqual({ kind: "literal", values: ["only"] });
	});

	test("boolean | string → unknown with raw type string", () => {
		const boolOrString = findProp(props, "boolOrString")!;
		expect(boolOrString.type).toEqual({
			kind: "unknown",
			raw: expect.stringContaining("string"),
		});
	});

	test('"a" | "b" | string → string (wide union absorbs literals)', () => {
		const wide = findProp(props, "wide")!;
		expect(wide.type).toEqual({ kind: "string" });
	});
});

// --- Edge cases ---

describe("edge cases", () => {
	test("empty props interface → empty array", async () => {
		const props = await extractProps("stories/Empty.stories.tsx");
		expect(props).not.toBeNull();
		expect(props!).toHaveLength(0);
	});

	test("no define() call → null", async () => {
		const props = await extractProps("stories/NoDefine.stories.tsx");
		expect(props).toBeNull();
	});

	test("nonexistent file → null", async () => {
		const props = await extractProps("stories/DoesNotExist.stories.tsx");
		expect(props).toBeNull();
	});

	test("aliased getComponentMeta import → props still extracted", async () => {
		// `import { getComponentMeta as reg }` — the call is located by offset, so the
		// aliased callee name must not prevent prop extraction (previously returned []).
		const props = await extractProps("stories/Aliased.stories.tsx");
		expect(props).not.toBeNull();
		expect(props!.length).toBeGreaterThan(0);
		expect(findProp(props!, "size")).toBeDefined();
		expect(findProp(props!, "label")).toBeDefined();
	});

	test("edit to a dependency after start → re-extraction sees new content (no stale host cache)", async () => {
		// Guards the BuilderProgram switch: an incremental compiler host must not serve an
		// edited dependency from a stale cache across rebuilds.
		const compFile = resolve(FIXTURES, "components/_EditProbe.tsx");
		const storyFile = resolve(FIXTURES, "stories/_EditProbe.stories.tsx");
		const fresh = new TypeScriptClient(FIXTURES);
		try {
			writeFileSync(
				compFile,
				"export function EditProbe(props: { size: 'sm' | 'md' }) {\n\treturn props.size\n}\n",
			);
			writeFileSync(
				storyFile,
				"import { getComponentMeta } from '@dennation/typebook/react'\n" +
					"import { EditProbe } from '../components/_EditProbe'\n" +
					"export const probe = getComponentMeta(EditProbe)\n",
			);
			await fresh.start();
			const calls = scanMetaCalls(
				await parseProgram(storyFile, readFileSync(storyFile, "utf-8")),
			);
			const before = await fresh.getProps(storyFile, calls[0].callStart);
			expect(findProp(before!, "size")!.type).toEqual({
				kind: "literal",
				values: ["sm", "md"],
			});

			// Change the prop type in the dependency, not the registration file itself.
			writeFileSync(
				compFile,
				"export function EditProbe(props: { size: 'sm' | 'md' | 'lg' }) {\n\treturn props.size\n}\n",
			);
			await fresh.notifyChange([compFile]);
			const after = await fresh.getProps(storyFile, calls[0].callStart);
			expect(findProp(after!, "size")!.type).toEqual({
				kind: "literal",
				values: ["sm", "md", "lg"],
			});
		} finally {
			rmSync(compFile, { force: true });
			rmSync(storyFile, { force: true });
			fresh.stop();
		}
	});

	test("file created after start → props extracted once notifyChange adds it as a root", async () => {
		// A brand-new file that nothing imports isn't in the program's root set captured
		// at start; notifyChange([file]) must add it so getSourceFile resolves.
		const newFile = resolve(FIXTURES, "stories/_DynamicallyAdded.stories.tsx");
		const fresh = new TypeScriptClient(FIXTURES);
		await fresh.start(); // captures roots while the file does not exist yet
		try {
			writeFileSync(
				newFile,
				"import { getComponentMeta } from '@dennation/typebook/react'\n" +
					"import { Basic } from '../components/Basic'\n" +
					"export const added = getComponentMeta(Basic, { defaultProps: { label: 'h' } })\n",
			);
			const calls = scanMetaCalls(
				await parseProgram(newFile, readFileSync(newFile, "utf-8")),
			);
			await fresh.notifyChange([newFile]);
			const props = await fresh.getProps(newFile, calls[0].callStart);
			expect(props).not.toBeNull();
			expect(findProp(props!, "size")).toBeDefined();
		} finally {
			rmSync(newFile, { force: true });
			fresh.stop();
		}
	});
});
