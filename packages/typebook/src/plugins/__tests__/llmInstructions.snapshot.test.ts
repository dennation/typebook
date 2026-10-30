import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { runCommands } from "../../generate/runCommands";
import { llmInstructions } from "../llm-instructions";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = nodePath.resolve(
	__dirname,
	"../../scanner/__tests__/fixtures",
);

// End to end over real modules: `@module` block with and without examples, none at all, compound,
// separate exports, a lone component, and deprecation of a part and of a whole module.
test("module cards and index match the snapshots", async () => {
	const outDir = await mkdtemp(nodePath.join(tmpdir(), "typebook-"));
	await runCommands({
		config: {
			components: "modules/*/index.{ts,tsx}",
			plugins: [
				llmInstructions({
					outDir,
					importFrom: (m) => `@acme/ui/${m.name}`,
					title: "@acme/ui",
					description: "Components of the Acme design system.",
				}),
			],
		},
		root: FIXTURES,
		names: ["llm-instructions:generate"],
		trigger: "cli",
	});

	const files = (await readdir(outDir)).sort();
	expect(files).toEqual([
		"button.md",
		"form.md",
		"index.md",
		"legacy-dialog.md",
		"popover.md",
		"tag.md",
	]);
	for (const file of files)
		await expect(
			await readFile(nodePath.join(outDir, file), "utf8"),
		).toMatchFileSnapshot(`__snapshots__/modules/${file}`);
});
