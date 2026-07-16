import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { TypeScriptClient } from "../ts-client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

describe("resolveConfigComponents: static resolution of typebook.config", () => {
	let client: TypeScriptClient;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
	});

	afterAll(() => client.stop());

	test("resolves imported components (bare + object form) to file + name", async () => {
		const resolved = await client.resolveConfigComponents(
			resolve(FIXTURES, "typebook.config.tsx"),
		);

		expect(resolved.map((r) => r.name)).toEqual(["Basic", "WithChildren"]);
		expect(resolved[0].file).toMatch(/components\/Basic\.tsx$/);
		expect(resolved[1].file).toMatch(/components\/WithChildren\.tsx$/);
	});
});
