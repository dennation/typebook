import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { describe, expect, test } from "vitest";
import type { CommandCtx, ComponentInfo } from "../../types";
import { DEFAULT_PROP_FILTER, llmInstructions } from "../llm-instructions";

const doc: ComponentInfo = {
	name: "Button",
	file: "/x/Button.tsx",
	sourceFile: "/x/Button.tsx",
	dir: "/x",
	description: "A clickable button.",
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

const card: ComponentInfo = { ...doc, name: "Card", description: "A surface." };

const tmp = () => mkdtemp(nodePath.join(tmpdir(), "typebook-"));

/** Run one of the plugin's commands and return what landed on disk, keyed by path. */
async function invoke(
	command: "llm-instructions:generate" | "llm-instructions:check",
	options: Parameters<typeof llmInstructions>[0],
	components: ComponentInfo[] = [doc],
	ctxOverrides: Partial<CommandCtx> = {},
) {
	const ctx: CommandCtx = {
		root: "/proj",
		args: [],
		trigger: "cli",
		components: () => Promise.resolve(components),
		...ctxOverrides,
	};
	const plugin = llmInstructions(options);
	const run = plugin.commands?.[command]?.run;
	if (!run) throw new Error(`llmInstructions has no "${command}" command`);
	await run(ctx);
}

/** Run `generate` into a real directory and read the result back. */
async function run(
	options: Omit<Parameters<typeof llmInstructions>[0], "outDir"> & {
		outDir?: string;
	},
	components: ComponentInfo[] = [doc],
) {
	const root = await tmp();
	const outDir = options.outDir ?? "docs";
	await invoke(
		"llm-instructions:generate",
		{ ...options, outDir },
		components,
		{ root },
	);

	const dir = nodePath.isAbsolute(outDir)
		? outDir
		: nodePath.join(root, outDir);
	const { globSync } = await import("tinyglobby");
	const files = globSync("**/*", { cwd: dir, absolute: true });
	return Object.fromEntries(
		await Promise.all(
			files.map(
				async (file) =>
					[
						`/proj/${outDir}/${nodePath.relative(dir, file).replaceAll(nodePath.sep, "/")}`,
						await readFile(file, "utf8"),
					] as const,
			),
		),
	);
}

describe("llmInstructions: commands", () => {
	test("registers generate and check, and nothing else", () => {
		expect(
			Object.keys(llmInstructions({ outDir: "docs" }).commands ?? {}),
		).toEqual(["llm-instructions:generate", "llm-instructions:check"]);
	});

	test("check fails on missing cards and writes nothing", async () => {
		const root = await tmp();
		await expect(
			invoke("llm-instructions:check", { outDir: "docs" }, [doc], { root }),
		).rejects.toThrow(/out of date/);
		await expect(
			readFile(nodePath.join(root, "docs/Button.md")),
		).rejects.toThrow();
	});

	test("check passes once generate has run", async () => {
		const root = await tmp();
		await invoke("llm-instructions:generate", { outDir: "docs" }, [doc], {
			root,
		});
		await expect(
			invoke("llm-instructions:check", { outDir: "docs" }, [doc], { root }),
		).resolves.toBeUndefined();
	});
});

describe("llmInstructions: layout", () => {
	test("cards default to {Name}.md in outDir, alongside index.md", async () => {
		expect(Object.keys(await run({ outDir: "docs" })).sort()).toEqual([
			"/proj/docs/Button.md",
			"/proj/docs/index.md",
		]);
	});

	test("an absolute outDir is used as-is", async () => {
		const root = await tmp();
		const outDir = nodePath.join(root, "elsewhere/docs");
		await invoke("llm-instructions:generate", { outDir }, [doc], { root });

		expect(
			await readFile(nodePath.join(outDir, "Button.md"), "utf8"),
		).toContain("## Button");
	});

	test("fileName renames and may nest inside outDir", async () => {
		const files = await run({
			outDir: "docs",
			fileName: (c) => `forms/${c.name}.gen.md`,
		});
		expect(files).toHaveProperty(["/proj/docs/forms/Button.gen.md"]);
	});

	test("indexName renames the index, false drops it", async () => {
		expect(await run({ outDir: "docs", indexName: "llms.md" })).toHaveProperty([
			"/proj/docs/llms.md",
		]);
		expect(
			Object.keys(await run({ outDir: "docs", indexName: false })),
		).toEqual(["/proj/docs/Button.md"]);
	});

	// The whole point of one directory: copy it anywhere and the links still resolve.
	test("a name escaping outDir is rejected", async () => {
		await expect(
			run({ outDir: "docs", fileName: (c) => `../${c.name}.md` }),
		).rejects.toThrow(/escapes the output directory/);
		await expect(
			run({ outDir: "docs", fileName: (c) => `/abs/${c.name}.md` }),
		).rejects.toThrow(/escapes the output directory/);
	});
});

describe("llmInstructions: name collisions", () => {
	const forms: ComponentInfo = {
		...doc,
		sourceFile: "/proj/src/forms/Button.tsx",
		dir: "/proj/src/forms",
	};
	const toolbar: ComponentInfo = {
		...doc,
		sourceFile: "/proj/src/toolbar/Button.tsx",
		dir: "/proj/src/toolbar",
	};

	// Silently keeping the last one would leave the index listing both under the same link — an
	// agent following one entry would read the other component's props.
	test("two same-named components in different folders fail, naming both", async () => {
		await expect(run({ outDir: "docs" }, [forms, toolbar])).rejects.toThrow(
			/src\/forms\/Button\.tsx.*src\/toolbar\/Button\.tsx.*both map to "Button\.md"/s,
		);
	});

	test("fileName gets { root }, so it can mirror the source layout", async () => {
		const root = await tmp();
		let seen = "";
		await invoke(
			"llm-instructions:generate",
			{
				outDir: "docs",
				indexName: false,
				fileName: (c, ctx) => {
					seen = ctx.root;
					return `${nodePath.basename(c.dir)}/${c.name}.md`;
				},
			},
			[forms, toolbar],
			{ root },
		);

		expect(seen).toBe(root);
		expect(
			await readFile(nodePath.join(root, "docs/forms/Button.md"), "utf8"),
		).toContain("## Button");
		expect(
			await readFile(nodePath.join(root, "docs/toolbar/Button.md"), "utf8"),
		).toContain("## Button");
	});

	test("grouping by folder separates them", async () => {
		const files = await run(
			{
				outDir: "docs",
				fileName: (c) => `${c.dir.split("/").pop()}/${c.name}.md`,
			},
			[forms, toolbar],
		);
		expect(Object.keys(files).sort()).toEqual([
			"/proj/docs/forms/Button.md",
			"/proj/docs/index.md",
			"/proj/docs/toolbar/Button.md",
		]);
	});

	test("a card colliding with the index fails too", async () => {
		await expect(
			run({ outDir: "docs", fileName: () => "index.md" }),
		).rejects.toThrow(/the index and "Button".*both map to "index\.md"/s);
	});
});

describe("llmInstructions: index", () => {
	test("links each card relative to the index, sorted by name", async () => {
		const files = await run({ outDir: "docs" }, [card, doc]);

		expect(files["/proj/docs/index.md"]).toContain(
			"- [Button](Button.md): A clickable button.",
		);
		const index = files["/proj/docs/index.md"];
		expect(index.indexOf("[Button]")).toBeLessThan(index.indexOf("[Card]"));
	});

	test("a nested card is linked by its path inside the directory", async () => {
		const files = await run({
			outDir: "docs",
			fileName: (c) => `forms/${c.name}.md`,
		});
		expect(files["/proj/docs/index.md"]).toContain("(forms/Button.md)");
	});

	test("an index nested deeper links back out to the cards", async () => {
		const files = await run({ outDir: "docs", indexName: "meta/index.md" });
		expect(files["/proj/docs/meta/index.md"]).toContain("(../Button.md)");
	});
});

describe("llmInstructions: prop policy", () => {
	test("a card keeps own props, hides inherited groups by default", async () => {
		const files = await run({ outDir: "docs", indexName: false });
		const content = files["/proj/docs/Button.md"];

		expect(content).toContain("`variant`"); // own
		expect(content).not.toContain("`onClick`"); // event:mouse (hidden)
		expect(content).not.toContain("`aria-label`"); // aria (hidden)
	});

	test("a custom filterProps predicate overrides the default", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			filterProps: () => true, // hide nothing → inherited aria now shows
		});
		expect(files["/proj/docs/Button.md"]).toContain("`aria-label`");
	});

	test("a filterProps map rescues one name, keeps the rest hidden", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			filterProps: { ...DEFAULT_PROP_FILTER, "aria-label": true },
		});
		expect(files["/proj/docs/Button.md"]).toContain("`aria-label`"); // rescued by name
		expect(files["/proj/docs/Button.md"]).not.toContain("`onClick`"); // still hidden by its group
	});

	test("keepOwnProps: false filters own props by group too", async () => {
		const shown = await run({ outDir: "docs", indexName: false });
		expect(shown["/proj/docs/Button.md"]).toContain("`size`"); // own element prop kept

		const hidden = await run({
			outDir: "docs",
			indexName: false,
			keepOwnProps: false,
		});
		expect(hidden["/proj/docs/Button.md"]).not.toContain("`size`"); // now filtered by element group
		expect(hidden["/proj/docs/Button.md"]).toContain("`variant`"); // ungrouped own → still kept
	});
});

describe("llmInstructions: filterComponents", () => {
	test("a dropped component produces no card and no index entry", async () => {
		const files = await run({
			outDir: "docs",
			filterComponents: (c) => c.name !== "Button",
		});
		expect(files["/proj/docs/Button.md"]).toBeUndefined();
		expect(files["/proj/docs/index.md"]).not.toContain("Button");
	});
});

describe("llmInstructions: format", () => {
	test("a custom format replaces the default card", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			fileName: (c) => `${c.name}.json`,
			format: (c) => JSON.stringify({ name: c.name, props: c.props.length }),
		});
		expect(files["/proj/docs/Button.json"]).toBe(
			'{"name":"Button","props":4}\n',
		);
	});
});

describe("llmInstructions: importFrom", () => {
	test("a function receives the component and root", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			importFrom: (c, { root }) => `pkg[root=${root}][dir=${c.dir}]`,
		});
		expect(files["/proj/docs/Button.md"]).toMatch(
			/import \{ Button \} from "pkg\[root=\/.+\]\[dir=\/x\]"/,
		);
	});
});
