import { describe, expect, test } from "vitest";
import type { ComponentInfo, GenerateCtx } from "../../types";
import {
	DEFAULT_PROP_FILTER,
	type EntryPathContext,
	llmInstructions,
} from "../llm-instructions";

/** entryPath that writes `{sub}{Name}.md` next to the component. */
const entry =
	(sub = "") =>
	(c: ComponentInfo, { componentDir }: EntryPathContext) =>
		`${componentDir}/${sub}${c.name}.md`;

const doc: ComponentInfo = {
	name: "Button",
	file: "/x/Button.tsx",
	sourceFile: "/x/Button.tsx",
	props: [
		{ name: "variant", optional: true, type: { kind: "string" } }, // own, ungrouped
		{
			name: "size",
			optional: true,
			type: { kind: "string" },
			group: "element",
		}, // own, grouped
		{
			name: "aria-label",
			optional: true,
			type: { kind: "string" },
			group: "aria",
			inheritedFrom: "@types/react",
		},
		{
			name: "onClick",
			optional: true,
			type: { kind: "function", raw: "() => void" },
			group: "event:mouse",
			inheritedFrom: "@types/react",
		},
	],
};

/** Run the plugin against one doc and return the written files by path. */
async function run(
	options: Parameters<typeof llmInstructions>[0],
	ctxOverrides: Partial<GenerateCtx> = {},
) {
	const files: Record<string, string> = {};
	const ctx: GenerateCtx = {
		command: "build",
		root: "/",
		writeFile: async (p, c) => {
			files[p] = c;
		},
		...ctxOverrides,
	};
	await llmInstructions(options).generate([doc], ctx);
	return files;
}

describe("llmInstructions: out path", () => {
	test("resolves relative to the component's folder", async () => {
		// sourceFile is /x/Button.tsx → `.` puts the card next to it, a subdir nests beside it.
		expect(await run({ entryPath: entry(), indexPath: false })).toHaveProperty([
			"/x/Button.md",
		]);
		expect(
			await run({ entryPath: entry("docs/"), indexPath: false }),
		).toHaveProperty(["/x/docs/Button.md"]);
	});

	test("an absolute path from a function is used as-is", async () => {
		const files = await run({
			entryPath: () => "/abs/Button.md",
			indexPath: false,
		});
		expect(files["/abs/Button.md"]).toBeDefined();
	});
});

describe("llmInstructions: prop policy", () => {
	test("a card keeps own props, hides inherited groups by default", async () => {
		const files = await run({ entryPath: entry("out/"), indexPath: false });
		const card = files["/x/out/Button.md"];

		expect(card).toContain("`variant`"); // own
		expect(card).not.toContain("`onClick`"); // event:mouse (hidden)
		expect(card).not.toContain("`aria-label`"); // aria (hidden)
	});

	test("a custom filterProps predicate overrides the default", async () => {
		const files = await run({
			entryPath: entry("out/"),
			indexPath: false,
			filterProps: () => true, // hide nothing → inherited aria now shows
		});
		expect(files["/x/out/Button.md"]).toContain("`aria-label`");
	});

	test("a filterProps map rescues one name, keeps the rest hidden", async () => {
		const files = await run({
			entryPath: entry("out/"),
			indexPath: false,
			filterProps: { ...DEFAULT_PROP_FILTER, "aria-label": true },
		});
		const card = files["/x/out/Button.md"];
		expect(card).toContain("`aria-label`"); // rescued by name
		expect(card).not.toContain("`onClick`"); // still hidden by its group
	});

	test("keepOwnProps: false filters own props by group too", async () => {
		const shown = await run({ entryPath: entry("out/"), indexPath: false }); // default: keepOwnProps true
		expect(shown["/x/out/Button.md"]).toContain("`size`"); // own element prop kept

		const hidden = await run({
			entryPath: entry("out/"),
			indexPath: false,
			keepOwnProps: false,
		});
		expect(hidden["/x/out/Button.md"]).not.toContain("`size`"); // now filtered by element group
		expect(hidden["/x/out/Button.md"]).toContain("`variant`"); // ungrouped own → still kept
	});
});

describe("llmInstructions: filterComponents", () => {
	test("a dropped component produces no card and no index entry", async () => {
		const files = await run({
			entryPath: entry("out/"),
			indexPath: "components.md",
			filterComponents: (c) => c.name !== "Button",
		});
		expect(files["/x/out/Button.md"]).toBeUndefined();
		expect(files["components.md"]).not.toContain("Button");
	});
});

describe("llmInstructions: format", () => {
	test("a custom format replaces the default card", async () => {
		const files = await run({
			entryPath: (c, { componentDir }) => `${componentDir}/out/${c.name}.json`,
			indexPath: false,
			format: (c) => JSON.stringify({ name: c.name, props: c.props.length }),
		});
		expect(files["/x/out/Button.json"]).toBe('{"name":"Button","props":4}');
	});
});

describe("llmInstructions: emitToOutDir", () => {
	const outDir = "/proj/dist";

	test("build: writes a flat published copy to the output dir root", async () => {
		const files = await run(
			{ entryPath: entry(), indexPath: "components.md", emitToOutDir: true },
			{ outDir },
		);
		expect(files["/x/Button.md"]).toBeDefined(); // main co-located output
		expect(files["components.md"]).toBeDefined(); // main index
		expect(files["/proj/dist/Button.md"]).toBeDefined(); // published copy
		expect(files["/proj/dist/index.md"]).toBeDefined(); // published index
	});

	test("a string value nests the copy in a subdirectory", async () => {
		const files = await run(
			{ entryPath: entry(), indexPath: false, emitToOutDir: "docs" },
			{ outDir },
		);
		expect(files["/proj/dist/docs/Button.md"]).toBeDefined();
		expect(files["/proj/dist/docs/index.md"]).toBeDefined();
	});

	test("copy card content is identical to the main output", async () => {
		const files = await run(
			{ entryPath: entry(), indexPath: false, emitToOutDir: true },
			{ outDir },
		);
		expect(files["/proj/dist/Button.md"]).toBe(files["/x/Button.md"]);
	});

	test("copy index links each card relatively (flat)", async () => {
		const files = await run(
			{ entryPath: entry(), indexPath: false, emitToOutDir: true },
			{ outDir },
		);
		expect(files["/proj/dist/index.md"]).toContain("(Button.md)");
	});

	test("dev: does not write to the output dir", async () => {
		const files = await run(
			{ entryPath: entry(), indexPath: false, emitToOutDir: true },
			{ command: "dev", outDir },
		);
		expect(files["/x/Button.md"]).toBeDefined(); // main still written
		expect(files["/proj/dist/Button.md"]).toBeUndefined();
	});

	test("throws when the output dir is unknown", async () => {
		await expect(
			run(
				{ entryPath: entry(), indexPath: false, emitToOutDir: true },
				{ outDir: undefined },
			),
		).rejects.toThrow(/output directory is unknown/);
	});
});
