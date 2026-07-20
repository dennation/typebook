import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { ComponentInfo } from "../../types";
import { collectComponentInfos } from "../collectComponentInfos";
import { TypeScriptClient } from "../ts-client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

// --- component-level extraction (name, file, description, remarks, deprecated) ---

describe("component-level extraction", () => {
	let client: TypeScriptClient;
	let doc: ComponentInfo;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		const docs = await client.getExportedComponentInfos(
			resolve(FIXTURES, "components/WithComponentDoc.tsx"),
		);
		doc = docs.find((d) => d.name === "WithComponentDoc")!;
	});

	afterAll(() => client.stop());

	test("resolves the component name", () => {
		expect(doc.name).toBe("WithComponentDoc");
	});

	test("points file at the component's own module", () => {
		expect(doc.file).toMatch(/components\/WithComponentDoc\.tsx$/);
	});

	test("pulls the component-level JSDoc description", () => {
		expect(doc.description).toBe("A primary call-to-action button.");
	});

	test("pulls the component-level @remarks usage guidance", () => {
		expect(doc.remarks).toBe(
			"Use for the main action only; don't nest buttons.",
		);
	});

	test("pulls the component-level @deprecated note", () => {
		expect(doc.deprecated).toBe("use `Action` instead");
	});
});

// --- collectComponentInfos: export-based scan of configured files ---

describe("collectComponentInfos (export scan)", () => {
	let client: TypeScriptClient;
	let docs: ComponentInfo[];

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		const dir = resolve(FIXTURES, "components");
		const files = readdirSync(dir)
			.filter((f) => f.endsWith(".tsx"))
			.map((f) => resolve(dir, f));
		docs = await collectComponentInfos(client, files);
	});

	afterAll(() => client.stop());

	test("finds exported components by type", () => {
		expect(docs.map((d) => d.name)).toContain("Basic");
	});

	test("a generic component's export name has no type arguments", () => {
		expect(docs.map((d) => d.name)).toContain("Select");
	});

	test("extracts props of a scanned component", () => {
		const basic = docs.find((d) => d.name === "Basic");
		expect(basic?.props.map((p) => p.name)).toContain("size");
	});

	test("ignores class components (function components only)", () => {
		expect(docs.map((d) => d.name)).not.toContain("ClassComponent");
	});

	test("sourceFile equals file for a component in its own module", () => {
		const select = docs.find((d) => d.name === "Select");
		expect(select?.sourceFile).toBe(select?.file);
	});

	test("dir is the folder of the scanned module", () => {
		const basic = docs.find((d) => d.name === "Basic");
		expect(basic?.dir).toBe(resolve(FIXTURES, "components"));
	});

	test("classifies own standard-named props by group (no inheritedFrom)", () => {
		// `disabled` is declared by Basic itself — grouped by name, but not inherited.
		const disabled = docs
			.find((d) => d.name === "Basic")
			?.props.find((p) => p.name === "disabled");
		expect(disabled?.group).toBe("element");
		expect(disabled?.inheritedFrom).toBeUndefined();
	});
});

// --- deterministic prop order: same input → same order, whatever the scan order ---

describe("deterministic prop order", () => {
	/** Prop names of a component after scanning the fixtures in the given file order. */
	async function propOrder(
		fileOrder: string[],
		name: string,
	): Promise<string[]> {
		const client = new TypeScriptClient(FIXTURES);
		await client.start();
		let names: string[] = [];
		for (const file of fileOrder) {
			for (const doc of await client.getExportedComponentInfos(file)) {
				if (doc.name === name) names = doc.props.map((p) => p.name);
			}
		}
		client.stop();
		return names;
	}

	test("utility-type props keep declaration order regardless of scan order", async () => {
		// `Omit<FullProps, "c">` — the checker's member order for mapped types depends on the warm
		// program's cache state, so scanning the same files in a different order used to reorder these
		// props in the generated docs. Sorting by declaration site pins it to the authored order.
		const dir = resolve(FIXTURES, "components");
		const files = readdirSync(dir)
			.filter((f) => f.endsWith(".tsx"))
			.map((f) => resolve(dir, f));

		const forward = await propOrder(files, "OmittedComponent");
		const backward = await propOrder([...files].reverse(), "OmittedComponent");

		expect(forward).toEqual(["a", "b", "d"]);
		expect(backward).toEqual(forward);
	});
});

// --- re-export: `file` (declaration) diverges from `sourceFile` (scanned module) ---

describe("re-export scan", () => {
	let client: TypeScriptClient;
	let basic: ComponentInfo | undefined;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		const docs = await client.getExportedComponentInfos(
			resolve(FIXTURES, "components/ReExport.tsx"),
		);
		basic = docs.find((d) => d.name === "Basic");
	});

	afterAll(() => client.stop());

	test("file points at the component's own declaration", () => {
		expect(basic?.file).toMatch(/components\/Basic\.tsx$/);
	});

	test("sourceFile points at the scanned re-exporting module", () => {
		expect(basic?.sourceFile).toMatch(/components\/ReExport\.tsx$/);
	});
});
