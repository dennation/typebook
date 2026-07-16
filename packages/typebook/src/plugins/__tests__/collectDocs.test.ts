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

	test("globs the components and returns them with their full props (no filtering)", async () => {
		const [doc] = await collectDocs(client, FIXTURES, {
			components: "components/WithHtmlAttrs.tsx",
		});
		const names = doc.props.map((p) => p.name);

		expect(doc.name).toBe("WithHtmlAttrs");
		expect(names).toContain("variant"); // own
		// collectDocs does NOT hide anything — the group policy is the plugin's job
		expect(names).toContain("aria-label");
		expect(names).toContain("onGotPointerCapture");
	});
});
