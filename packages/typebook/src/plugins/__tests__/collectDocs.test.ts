import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { TypeScriptClient } from "../../scanner";
import { collectDocs } from "../collectDocs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "../../scanner/__tests__/fixtures");

describe("collectDocs", () => {
	let client: TypeScriptClient;

	beforeAll(async () => {
		client = new TypeScriptClient(FIXTURES);
		await client.start();
	});

	afterAll(() => client.stop());

	test("globs components and trims props by the default group policy", async () => {
		// WithHtmlAttrs extends button attributes → inherited props across many groups
		const [doc] = await collectDocs(client, FIXTURES, {
			components: "components/WithHtmlAttrs.tsx",
		});
		const names = doc.props.map((p) => p.name);

		expect(names).toContain("variant"); // own
		expect(names).toContain("id"); // global
		expect(names).toContain("disabled"); // element
		expect(names).not.toContain("aria-label"); // aria (hidden)
		expect(names).not.toContain("onGotPointerCapture"); // event:pointer (hidden)
	});

	test("config.hideGroups overrides the default policy", async () => {
		const [doc] = await collectDocs(client, FIXTURES, {
			components: "components/WithHtmlAttrs.tsx",
			hideGroups: ["element"], // hide only element → aria/etc now show
		});
		const names = doc.props.map((p) => p.name);

		expect(names).toContain("variant"); // own, always shown
		expect(names).not.toContain("disabled"); // element, now hidden
		expect(names).toContain("aria-label"); // aria, not in the override set → shown
	});
});
