import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, test } from "vitest";
import { scan } from "../../generate/scan";
import type { ModuleInfo } from "../../types";
import { collectModuleInfos } from "../collectModuleInfos";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

describe("collectModuleInfos", () => {
	let modules: ModuleInfo[];
	const byName = (name: string) => modules.find((m) => m.name === name)!;

	beforeAll(async () => {
		modules = await collectModuleInfos(
			await scan({ root: FIXTURES, components: "modules/*/index.{ts,tsx}" }),
		);
	});

	test("one module per scanned file, named after its folder, in scan order", () => {
		expect(modules.map((m) => m.name)).toEqual([
			"button",
			"form",
			"legacy-dialog",
			"popover",
			"tag",
		]);
		expect(byName("form").sourceFile).toBe(
			resolve(FIXTURES, "modules/form/index.ts"),
		);
		expect(byName("form").dir).toBe(resolve(FIXTURES, "modules/form"));
	});

	test("a compound module imports its parent once", () => {
		expect(byName("form").components.map((c) => c.name)).toEqual([
			"Form.Root",
			"Form.Input",
			"Form.Grid",
		]);
		expect(byName("form").bindings).toEqual(["Form"]);
	});

	test("separate exports are each a binding, in export order", () => {
		expect(byName("popover").bindings).toEqual([
			"Popover",
			"PopoverTrigger",
			"PopoverContent",
		]);
	});

	test("reads the @module block's prose and every @example body", () => {
		expect(byName("form").description).toBe(
			"Native form with a field grid.\n\nTwo columns. `Form.Input` spans both; any other child takes one — give it `col-span-full`.",
		);
		expect(byName("form").examples).toEqual([
			'```tsx\n<Form.Root>\n\t<Form.Input label="Email" />\n</Form.Root>\n```',
			'<Form.Root size="md" />',
		]);
	});

	test("a block after the last statement is found too", () => {
		expect(byName("popover").description).toBe(
			"A panel floating next to an element.",
		);
	});

	// The only source of a module's docs: no block, nothing is borrowed from a component.
	test("no @module block, no description or examples", () => {
		expect(byName("button")).not.toHaveProperty("description");
		expect(byName("button")).not.toHaveProperty("examples");
	});

	test("a @module block above a component stays out of its description", () => {
		expect(byName("tag").description).toBe(
			"A removable tag; for a static label use `Badge`.",
		);
		expect(byName("tag").components[0].description).toBe(
			"The tag itself, with a remove button.",
		);
	});
});
