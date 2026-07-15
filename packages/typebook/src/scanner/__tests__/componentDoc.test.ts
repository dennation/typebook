import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { ComponentDoc } from "../../types";
import { parseProgram } from "../ast";
import { collectComponentDocs } from "../collectComponentDocs";
import { componentToMarkdown } from "../componentToMarkdown";
import { scanMetaCalls } from "../meta-scanner";
import { TypeScriptClient } from "../ts-client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

// --- getComponentDoc: component-level extraction ---

describe("getComponentDoc", () => {
	let client: TypeScriptClient;
	let doc: ComponentDoc;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		const file = resolve(FIXTURES, "stories/WithComponentDoc.stories.tsx");
		const content = readFileSync(file, "utf-8");
		const calls = scanMetaCalls(await parseProgram(file, content));
		const result = await client.getComponentDoc(
			file,
			calls[0].callStart,
			content,
		);
		expect(result).not.toBeNull();
		doc = result!;
	});

	afterAll(() => client.stop());

	test("resolves the component name", () => {
		expect(doc.name).toBe("WithComponentDoc");
	});

	test("points file at the component's own module, not the story", () => {
		expect(doc.file).toMatch(/components\/WithComponentDoc\.tsx$/);
	});

	test("pulls the component-level JSDoc description", () => {
		expect(doc.description).toBe("A primary call-to-action button.");
	});

	test("pulls the component-level @deprecated note", () => {
		expect(doc.deprecated).toBe("use `Action` instead");
	});

	test("still extracts props", () => {
		expect(doc.props.map((p) => p.name)).toContain("size");
	});
});

// --- collectComponentDocs: export-based scan of configured files ---

describe("collectComponentDocs (export scan)", () => {
	let client: TypeScriptClient;
	let docs: ComponentDoc[];

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		const dir = resolve(FIXTURES, "components");
		const files = readdirSync(dir)
			.filter((f) => f.endsWith(".tsx"))
			.map((f) => resolve(dir, f));
		docs = await collectComponentDocs(client, files);
	});

	afterAll(() => client.stop());

	test("finds exported components by type (no getComponentMeta needed)", () => {
		expect(docs.map((d) => d.name)).toContain("Basic");
	});

	test("a generic component's export name has no type arguments", () => {
		expect(docs.map((d) => d.name)).toContain("Select");
	});

	test("extracts props of a scanned component", () => {
		const basic = docs.find((d) => d.name === "Basic");
		expect(basic?.props.map((p) => p.name)).toContain("size");
	});
});

// --- componentToMarkdown: pure rendering ---

describe("componentToMarkdown", () => {
	const doc: ComponentDoc = {
		name: "Button",
		file: "/x/Button.tsx",
		description: "Primary action button.",
		deprecated: "use `Action`",
		props: [
			{
				name: "size",
				optional: false,
				type: { kind: "literal", values: ["sm", "md"] },
				defaultValue: "'md'",
				description: "Button size",
			},
			{
				name: "onClick",
				optional: true,
				type: { kind: "function", raw: "() => void" },
			},
			{
				name: "className",
				optional: true,
				type: { kind: "string" },
				inherited: true,
			},
		],
	};

	test("renders heading, description, deprecation note", () => {
		const md = componentToMarkdown(doc);
		expect(md).toContain("## Button");
		expect(md).toContain("Primary action button.");
		expect(md).toContain("> ⚠️ **Deprecated:** use `Action`");
	});

	test("renders a props table with type, default, required", () => {
		const md = componentToMarkdown(doc);
		expect(md).toContain(
			'| `size` | `"sm" \\| "md"` | `\'md\'` | ✔ | Button size |',
		);
	});

	test("hides inherited props by default, shows them on request", () => {
		expect(componentToMarkdown(doc)).not.toContain("`className`");
		expect(componentToMarkdown(doc, { includeInherited: true })).toContain(
			"`className`",
		);
	});
});

// --- defineStories: scanner recognizes it, props extracted from return type ---

describe("defineStories injection", () => {
	let client: TypeScriptClient;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
	});

	afterAll(() => client.stop());

	test("scanMetaCalls finds a defineStories() call and getProps extracts the component's props", async () => {
		const file = resolve(FIXTURES, "stories/WithDefineStories.stories.tsx");
		const content = readFileSync(file, "utf-8");
		const calls = scanMetaCalls(await parseProgram(file, content));
		expect(calls).toHaveLength(1);
		const props = await client.getProps(file, calls[0].callStart, content);
		expect(props?.map((p) => p.name)).toContain("size");
	});
});
