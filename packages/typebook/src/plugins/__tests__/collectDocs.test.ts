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

	test("config drives the component set and applies per-component settings", async () => {
		const docs = await collectDocs(client, FIXTURES, {
			configFile: "typebook.config.tsx",
		});

		expect(docs.map((d) => d.name)).toEqual(["Basic", "WithChildren"]);
		// the WithChildren entry carries `omit: ["icon"]`
		const withChildren = docs.find((d) => d.name === "WithChildren")!;
		expect(withChildren.props.map((p) => p.name)).not.toContain("icon");
	});

	test("keeps only the config-listed export of a multi-export file", async () => {
		// WithInheritance.tsx exports ExtendedButton and IntersectionLink; the config lists only one
		const docs = await collectDocs(client, FIXTURES, {
			configFile: "typebook.config.one.tsx",
		});
		expect(docs.map((d) => d.name)).toEqual(["ExtendedButton"]);
	});

	test("default group policy hides noise groups, keeps own/global/element", async () => {
		// WithHtmlAttrs extends button attributes → inherited props across many groups
		const [doc] = await collectDocs(client, FIXTURES, {
			configFile: "typebook.config.groups.tsx",
		});
		const names = doc.props.map((p) => p.name);

		expect(names).toContain("variant"); // own
		expect(names).toContain("id"); // global
		expect(names).toContain("disabled"); // element
		expect(names).not.toContain("aria-label"); // aria (hidden)
		expect(names).not.toContain("onGotPointerCapture"); // event:pointer (hidden)
	});
});
