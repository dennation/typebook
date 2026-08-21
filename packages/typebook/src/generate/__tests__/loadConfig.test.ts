import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadConfig } from "../loadConfig";

const tmp = () => mkdtemp(path.join(tmpdir(), "typebook-"));

describe("loadConfig", () => {
	test("loads a TypeScript config natively and roots it at the config's directory", async () => {
		const dir = await tmp();
		await writeFile(
			path.join(dir, "typebook.config.ts"),
			`const config: { components: string } = { components: "src/**/*.tsx" }\nexport default config\n`,
		);

		const loaded = await loadConfig(dir);

		expect(loaded.config.components).toBe("src/**/*.tsx");
		expect(loaded.root).toBe(dir);
	});

	test("accepts an explicit config path", async () => {
		const dir = await tmp();
		await writeFile(
			path.join(dir, "custom.config.mjs"),
			`export default { components: "lib/**/*.tsx" }\n`,
		);

		const loaded = await loadConfig(dir, "custom.config.mjs");

		expect(loaded.config.components).toBe("lib/**/*.tsx");
	});

	test("names the candidates it looked for when there is no config", async () => {
		await expect(loadConfig(await tmp())).rejects.toThrow(
			/typebook\.config\.ts/,
		);
	});

	test("a config without a default export is an error, not an empty config", async () => {
		const dir = await tmp();
		await writeFile(
			path.join(dir, "typebook.config.mjs"),
			`export const config = { components: "x" }\n`,
		);

		await expect(loadConfig(dir)).rejects.toThrow(/no default export/);
	});
});
