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

	/** The literal values of a component's prop after scanning the fixtures in the given order. */
	async function literalValues(
		fileOrder: string[],
		name: string,
		prop: string,
	): Promise<string[]> {
		const client = new TypeScriptClient(FIXTURES);
		await client.start();
		let values: string[] = [];
		for (const file of fileOrder) {
			for (const doc of await client.getExportedComponentInfos(file)) {
				if (doc.name !== name) continue;
				const type = doc.props.find((p) => p.name === prop)?.type;
				if (type?.kind === "literal") values = type.values;
			}
		}
		client.stop();
		return values;
	}

	test("literal-union values keep authored order regardless of scan order", async () => {
		// `variant?: "solid" | "outline" | "ghost"` — the checker's union member order is cache-state
		// dependent too, so a different scan order used to reshuffle a prop's allowed values. The
		// authored source order is recovered from the declaration and pinned.
		const dir = resolve(FIXTURES, "components");
		const files = readdirSync(dir)
			.filter((f) => f.endsWith(".tsx"))
			.map((f) => resolve(dir, f));

		const forward = await literalValues(files, "Basic", "variant");
		const backward = await literalValues(
			[...files].reverse(),
			"Basic",
			"variant",
		);

		expect(forward).toEqual(["solid", "outline", "ghost"]);
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

// --- compound exports: members become `Parent.Member` components with `parent` set ---

describe("compound exports", () => {
	let client: TypeScriptClient;
	let docs: ComponentInfo[];
	const named = (name: string) => docs.find((d) => d.name === name);

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
		docs = await client.getExportedComponentInfos(
			resolve(FIXTURES, "components/Compound.tsx"),
		);
	});

	afterAll(() => client.stop());

	test("an object namespace yields its members, not itself", () => {
		expect(named("Tabs")).toBeUndefined();
		expect(named("Tabs.Root")?.parent).toBe("Tabs");
		expect(named("Tabs.Tab")?.parent).toBe("Tabs");
	});

	test("a member's props, defaults and JSDoc come from the assigned component", () => {
		const tab = named("Tabs.Tab");
		expect(tab?.description).toBe("One tab.");
		expect(tab?.remarks).toBe("Put it inside `Tabs.Root`.");
		expect(tab?.props.find((p) => p.name === "disabled")?.defaultValue).toBe(
			"false",
		);
	});

	test("shorthand and inline members are read too", () => {
		expect(named("Tabs.TabsTab")?.description).toBe("One tab.");
		expect(
			named("Tabs.inline")?.props.find((p) => p.name === "label")?.defaultValue,
		).toBe('"x"');
	});

	test("a foreign member keeps its declaration as file (so a consumer can filter it)", () => {
		expect(named("Tabs.Frag")?.file).toMatch(/node_modules\/@types\/react\//);
	});

	test("Object.assign(Root, members) yields the root and its members", () => {
		expect(named("Card")?.parent).toBeUndefined();
		expect(named("Card.Header")?.parent).toBe("Card");
	});

	test("an expando member on a function declaration", () => {
		expect(named("Menu.Item")?.parent).toBe("Menu");
	});

	test("a framework wrapper's own properties are not members", () => {
		expect(named("Memoized")).toBeDefined();
		expect(named("Memoized.type")).toBeUndefined();
	});

	test("a top-level component has no parent", () => {
		expect(named("Menu")?.parent).toBeUndefined();
	});
});
