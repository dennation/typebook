import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { parseProgram } from "../ast";
import { scanSnippets } from "../snippet-scanner";
import { TypeScriptClient } from "../ts-client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

let client: TypeScriptClient;

beforeAll(async () => {
	client = new TypeScriptClient(FIXTURES);
	await client.start();
});

afterAll(() => {
	client.stop();
});

// getSnippetSource: resolve a `<Snippet source={ref}>` reference across modules.
describe("getSnippetSource", () => {
	const pageFile = resolve(FIXTURES, "snippets/Page.tsx");

	/** Scan Page.tsx, returning each snippet's `source` ref name → resolved source. */
	async function resolveSnippetSources() {
		const content = readFileSync(pageFile, "utf-8");
		const blocks = scanSnippets(await parseProgram(pageFile, content), content);
		const out: Record<string, { source: string; file: string }> = {};
		for (const block of blocks) {
			if (!block.sourceRef) continue;
			const resolved = await client.getSnippetSource(
				pageFile,
				block.sourceRef.offset,
				content,
			);
			expect(resolved).not.toBeNull();
			out[block.sourceRef.name] = resolved!;
		}
		return out;
	}

	test("resolves an imported arrow demo's expression body", async () => {
		const sources = await resolveSnippetSources();
		expect(sources.ButtonDemo.source).toBe(
			'<button type="button">Click</button>',
		);
		// Cross-module: the source comes from demos.tsx, not Page.tsx.
		expect(sources.ButtonDemo.file).toMatch(/snippets[/\\]demos\.tsx$/);
	});

	test("resolves an imported function demo's block body (braces stripped, dedented)", async () => {
		const sources = await resolveSnippetSources();
		expect(sources.Counter.source).toBe(
			"const n = 1;\nreturn <span>{n}</span>;",
		);
		expect(sources.Counter.file).toMatch(/snippets[/\\]demos\.tsx$/);
	});

	test("resolves a demo declared in the same file", async () => {
		const sources = await resolveSnippetSources();
		expect(sources.LocalDemo.source).toBe("<i>local</i>");
		expect(sources.LocalDemo.file).toMatch(/snippets[/\\]Page\.tsx$/);
	});

	test("returns null when the identifier doesn't resolve to a function", async () => {
		// Offset 0 is the start of an import keyword, not a function-bound identifier.
		const resolved = await client.getSnippetSource(pageFile, 0);
		expect(resolved).toBeNull();
	});
});
