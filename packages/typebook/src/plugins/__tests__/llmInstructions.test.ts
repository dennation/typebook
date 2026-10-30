import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { describe, expect, test } from "vitest";
import { moduleBindings } from "../../scanner/moduleBindings";
import type { CommandCtx, ComponentInfo, ModuleInfo } from "../../types";
import { DEFAULT_PROP_FILTER, llmInstructions } from "../llm-instructions";

const doc: ComponentInfo = {
	name: "Button",
	file: "/x/Button.tsx",
	sourceFile: "/x/button/index.ts",
	dir: "/x/button",
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

/** The module `ctx.modules()` would build for these components (one scanned file), sans `@module`. */
function moduleOf(
	components: ComponentInfo[],
	doc: Pick<ModuleInfo, "description" | "examples"> = {},
): ModuleInfo {
	const { dir, sourceFile } = components[0];
	return {
		name: nodePath.basename(dir),
		dir,
		sourceFile,
		components,
		bindings: moduleBindings(components),
		...doc,
	};
}

/** `doc` in a module of its own, in folder `name`. */
function single(name: string, overrides: Partial<ComponentInfo> = {}) {
	return moduleOf([
		{
			...doc,
			sourceFile: `/x/${name}/index.ts`,
			dir: `/x/${name}`,
			...overrides,
		},
	]);
}

const button = moduleOf([doc]);
const card = single("card", { name: "Card", description: "A surface." });

const tmp = () => mkdtemp(nodePath.join(tmpdir(), "typebook-"));

/** Run one of the plugin's commands and return what landed on disk, keyed by path. */
async function invoke(
	command: "llm-instructions:generate" | "llm-instructions:check",
	options: Parameters<typeof llmInstructions>[0],
	modules: ModuleInfo[] = [button],
	ctxOverrides: Partial<CommandCtx> = {},
) {
	const ctx: CommandCtx = {
		root: "/proj",
		args: [],
		trigger: "cli",
		components: () => Promise.resolve(modules.flatMap((m) => m.components)),
		modules: () => Promise.resolve(modules),
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
	modules: ModuleInfo[] = [button],
) {
	const root = await tmp();
	const outDir = options.outDir ?? "docs";
	await invoke("llm-instructions:generate", { ...options, outDir }, modules, {
		root,
	});

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

	// A card for a module that no longer exists is worse than a missing one: an agent finds it
	// and reads documentation for something that isn't there any more.
	test("generate removes cards nothing produces any more", async () => {
		const root = await tmp();
		const gone = single("gone");
		await invoke(
			"llm-instructions:generate",
			{ outDir: "docs" },
			[button, gone],
			{
				root,
			},
		);
		expect(
			await readFile(nodePath.join(root, "docs/gone.md"), "utf8"),
		).toBeTruthy();

		await invoke("llm-instructions:generate", { outDir: "docs" }, [button], {
			root,
		});

		await expect(
			readFile(nodePath.join(root, "docs/gone.md"), "utf8"),
		).rejects.toThrow();
		expect(
			await readFile(nodePath.join(root, "docs/button.md"), "utf8"),
		).toBeTruthy();
	});

	test("check counts a leftover card as out of date", async () => {
		const root = await tmp();
		await invoke(
			"llm-instructions:generate",
			{ outDir: "docs" },
			[button, single("gone")],
			{ root },
		);

		await expect(
			invoke("llm-instructions:check", { outDir: "docs" }, [button], { root }),
		).rejects.toThrow(/gone\.md \(no longer generated\)/);
	});

	test("a removed group leaves no empty directory behind", async () => {
		const root = await tmp();
		const options = {
			outDir: "docs",
			indexName: false as const,
			fileName: (m: ModuleInfo) => `${m.name}/card.md`,
		};
		await invoke(
			"llm-instructions:generate",
			options,
			[button, single("gone")],
			{
				root,
			},
		);

		await invoke("llm-instructions:generate", options, [button], { root });

		await expect(
			readFile(nodePath.join(root, "docs/gone/card.md"), "utf8"),
		).rejects.toThrow();
		expect(await readdir(nodePath.join(root, "docs"))).toEqual(["button"]);
	});

	test("check fails on missing cards and writes nothing", async () => {
		const root = await tmp();
		await expect(
			invoke("llm-instructions:check", { outDir: "docs" }, [button], { root }),
		).rejects.toThrow(/out of date/);
		await expect(
			readFile(nodePath.join(root, "docs/button.md")),
		).rejects.toThrow();
	});

	test("check passes once generate has run", async () => {
		const root = await tmp();
		await invoke("llm-instructions:generate", { outDir: "docs" }, [button], {
			root,
		});
		await expect(
			invoke("llm-instructions:check", { outDir: "docs" }, [button], { root }),
		).resolves.toBeUndefined();
	});
});

describe("llmInstructions: layout", () => {
	test("cards default to {module}.md in outDir, alongside index.md", async () => {
		expect(Object.keys(await run({ outDir: "docs" })).sort()).toEqual([
			"/proj/docs/button.md",
			"/proj/docs/index.md",
		]);
	});

	test("an absolute outDir is used as-is", async () => {
		const root = await tmp();
		const outDir = nodePath.join(root, "elsewhere/docs");
		await invoke("llm-instructions:generate", { outDir }, [button], { root });

		expect(
			await readFile(nodePath.join(outDir, "button.md"), "utf8"),
		).toContain("## button");
	});

	test("fileName renames and may nest inside outDir", async () => {
		const files = await run({
			outDir: "docs",
			fileName: (m) => `forms/${m.name}.gen.md`,
		});
		expect(files).toHaveProperty(["/proj/docs/forms/button.gen.md"]);
	});

	test("indexName renames the index, false drops it", async () => {
		expect(await run({ outDir: "docs", indexName: "llms.md" })).toHaveProperty([
			"/proj/docs/llms.md",
		]);
		expect(
			Object.keys(await run({ outDir: "docs", indexName: false })),
		).toEqual(["/proj/docs/button.md"]);
	});

	// The whole point of one directory: copy it anywhere and the links still resolve.
	test("a name escaping outDir is rejected", async () => {
		await expect(
			run({ outDir: "docs", fileName: (m) => `../${m.name}.md` }),
		).rejects.toThrow(/escapes the output directory/);
		await expect(
			run({ outDir: "docs", fileName: (m) => `/abs/${m.name}.md` }),
		).rejects.toThrow(/escapes the output directory/);
	});
});

describe("llmInstructions: name collisions", () => {
	const current = moduleOf([
		{
			...doc,
			name: "Dialog",
			sourceFile: "/proj/src/components/dialog/index.ts",
			dir: "/proj/src/components/dialog",
		},
	]);
	const legacy = moduleOf([
		{
			...doc,
			name: "Dialog",
			sourceFile: "/proj/src/deprecated/dialog/index.ts",
			dir: "/proj/src/deprecated/dialog",
		},
	]);

	// Silently keeping the last one would leave the index listing both under the same link — an
	// agent following one line would read the other module's props.
	test("two same-named modules in different folders fail, naming both", async () => {
		await expect(run({ outDir: "docs" }, [current, legacy])).rejects.toThrow(
			/src\/components\/dialog\/index\.ts.*src\/deprecated\/dialog\/index\.ts.*both map to "dialog\.md"/s,
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
				fileName: (m, ctx) => {
					seen = ctx.root;
					return `${nodePath.relative("/proj/src", m.dir)}.md`;
				},
			},
			[current, legacy],
			{ root },
		);

		expect(seen).toBe(root);
		expect(
			await readFile(nodePath.join(root, "docs/components/dialog.md"), "utf8"),
		).toContain("## dialog");
		expect(
			await readFile(nodePath.join(root, "docs/deprecated/dialog.md"), "utf8"),
		).toContain("## dialog");
	});

	test("a card colliding with the index fails too", async () => {
		await expect(
			run({ outDir: "docs", fileName: () => "index.md" }),
		).rejects.toThrow(/the index and "button".*both map to "index\.md"/s);
	});
});

describe("llmInstructions: index", () => {
	const index = async (
		modules: ModuleInfo[],
		options: Omit<Parameters<typeof llmInstructions>[0], "outDir"> = {},
	) =>
		(await run({ outDir: "docs", ...options }, modules))["/proj/docs/index.md"];

	test("links each card under its import, sorted by module name", async () => {
		const text = await index([card, button], { importFrom: "@acme/ui" });

		expect(text).toContain(
			'- [`import { Button } from "@acme/ui"`](button.md)',
		);
		expect(text.indexOf("(button.md)")).toBeLessThan(text.indexOf("(card.md)"));
	});

	test("without importFrom, the link names the bindings", async () => {
		expect(await index([button])).toContain("- [`Button`](button.md)\n");
	});

	test("adds the first line of the module description, without its period", async () => {
		const described = moduleOf([doc], {
			description: "Clickable things.\n\nMore detail.",
		});
		expect(await index([described])).toContain(
			"- [`Button`](button.md) — Clickable things\n",
		);
	});

	// No description is no description: the component's name or doc is not borrowed.
	test("a module without a description gets the link alone", async () => {
		expect(await index([button])).toMatch(/^- \[`Button`\]\(button\.md\)$/m);
	});

	test("a compound module lists its parts, marking a deprecated one", async () => {
		const parts = moduleOf([
			{ ...doc, name: "Tabs.Root", parent: "Tabs" },
			{ ...doc, name: "Tabs.Tab", parent: "Tabs", deprecated: true },
		]);
		expect(await index([parts])).toContain(
			"- [`Tabs`](button.md) · parts: Tabs.Root, Tabs.Tab (deprecated)\n",
		);
	});

	test("parts list only the names the import hides", async () => {
		const mixed = moduleOf([
			{ ...doc, name: "Form.Input", parent: "Form" },
			{ ...doc, name: "FormInput" },
		]);
		expect(await index([mixed])).toContain(
			"- [`Form, FormInput`](button.md) · parts: Form.Input\n",
		);
	});

	// Every name is already in the import — listing them again would only repeat it.
	test("separate exports list no parts", async () => {
		const popover = moduleOf([doc, { ...doc, name: "ButtonGroup" }]);
		expect(await index([popover])).toContain(
			"- [`Button, ButtonGroup`](button.md)\n",
		);
	});

	test("a module whose every component is deprecated is marked as a whole", async () => {
		const legacy = moduleOf(
			[
				{ ...doc, name: "Tabs.Root", parent: "Tabs", deprecated: "use X" },
				{ ...doc, name: "Tabs.Tab", parent: "Tabs", deprecated: true },
			],
			{ description: "Old tabs." },
		);
		expect(await index([legacy])).toContain(
			"- [`Tabs`](button.md) — Old tabs · parts: Tabs.Root, Tabs.Tab · deprecated\n",
		);
	});

	test("a nested card is linked by its path inside the directory", async () => {
		expect(
			await index([button], { fileName: (m) => `forms/${m.name}.md` }),
		).toContain("(forms/button.md)");
	});

	test("an index nested deeper links back out to the cards", async () => {
		const files = await run({ outDir: "docs", indexName: "meta/index.md" });
		expect(files["/proj/docs/meta/index.md"]).toContain("(../button.md)");
	});
});

describe("llmInstructions: prop policy", () => {
	test("a card keeps own props, hides inherited groups by default", async () => {
		const files = await run({ outDir: "docs", indexName: false });
		const content = files["/proj/docs/button.md"];

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
		expect(files["/proj/docs/button.md"]).toContain("`aria-label`");
	});

	test("a filterProps map rescues one name, keeps the rest hidden", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			filterProps: { ...DEFAULT_PROP_FILTER, "aria-label": true },
		});
		expect(files["/proj/docs/button.md"]).toContain("`aria-label`"); // rescued by name
		expect(files["/proj/docs/button.md"]).not.toContain("`onClick`"); // still hidden by its group
	});

	test("keepOwnProps: false filters own props by group too", async () => {
		const shown = await run({ outDir: "docs", indexName: false });
		expect(shown["/proj/docs/button.md"]).toContain("`size`"); // own element prop kept

		const hidden = await run({
			outDir: "docs",
			indexName: false,
			keepOwnProps: false,
		});
		expect(hidden["/proj/docs/button.md"]).not.toContain("`size`"); // now filtered by element group
		expect(hidden["/proj/docs/button.md"]).toContain("`variant`"); // ungrouped own → still kept
	});
});

describe("llmInstructions: filterComponents", () => {
	const withContext = moduleOf([doc, { ...doc, name: "ButtonContext" }]);

	test("a dropped component leaves its module's card and import", async () => {
		const files = await run(
			{
				outDir: "docs",
				importFrom: "@acme/ui",
				filterComponents: (c) => !c.name.endsWith("Context"),
			},
			[withContext],
		);
		expect(files["/proj/docs/button.md"]).not.toContain("ButtonContext");
		expect(files["/proj/docs/index.md"]).toContain(
			'[`import { Button } from "@acme/ui"`]',
		);
	});

	test("a module left with no components produces no card and no index line", async () => {
		const files = await run(
			{ outDir: "docs", filterComponents: (c) => c.name !== "Card" },
			[button, card],
		);
		expect(files["/proj/docs/card.md"]).toBeUndefined();
		expect(files["/proj/docs/index.md"]).not.toContain("card.md");
	});
});

describe("llmInstructions: format", () => {
	test("a custom format replaces the default card and gets the module", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			fileName: (m) => `${m.name}.json`,
			format: (m) =>
				JSON.stringify({ name: m.name, components: m.components.length }),
		});
		expect(files["/proj/docs/button.json"]).toBe(
			'{"name":"button","components":1}\n',
		);
	});
});

describe("llmInstructions: importFrom", () => {
	test("a function receives the module and root", async () => {
		const files = await run({
			outDir: "docs",
			indexName: false,
			importFrom: (m, { root }) => `pkg[root=${root}][dir=${m.dir}]`,
		});
		expect(files["/proj/docs/button.md"]).toMatch(
			/import \{ Button \} from "pkg\[root=\/.+\]\[dir=\/x\/button\]"/,
		);
	});

	test("one import line carries every binding of the module", async () => {
		const tabs = moduleOf([
			{ ...doc, name: "Tabs.Root", parent: "Tabs" },
			{ ...doc, name: "Tabs.Tab", parent: "Tabs" },
			{ ...doc, name: "useTabs" },
		]);
		const files = await run({ outDir: "docs", importFrom: "@acme/ui" }, [tabs]);
		expect(files["/proj/docs/button.md"]).toContain(
			'import { Tabs, useTabs } from "@acme/ui";',
		);
		expect(files["/proj/docs/button.md"]).toContain("### Tabs.Root");
		expect(files["/proj/docs/button.md"]).toContain("### Tabs.Tab");
	});
});
