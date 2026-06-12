import { describe, expect, test } from "vitest";
import { generateSnippetsFile } from "../snippet-generator.js";

describe("generateSnippetsFile", () => {
	test("emits a typed, satisfies-checked snippet map", () => {
		const out = generateSnippetsFile(
			[{ name: "button-group", code: "<Button>Hi</Button>" }],
			"/proj/src/snippets.gen.ts",
		);

		expect(out).toContain(
			"import type { SnippetMap } from '@dennation/typebook'",
		);
		expect(out).toContain("export const snippets = {");
		expect(out).toContain('"button-group": "<Button>Hi</Button>",');
		expect(out).toContain("} as const satisfies SnippetMap");
	});

	test("escapes quotes and newlines so the literal stays valid", () => {
		const out = generateSnippetsFile(
			[{ name: "x", code: '<div className="a">\n  line\n</div>' }],
			"/proj/src/snippets.gen.ts",
		);

		expect(out).toContain('"x": "<div className=\\"a\\">\\n  line\\n</div>",');
	});

	test("sorts entries by name for stable output", () => {
		const out = generateSnippetsFile(
			[
				{ name: "zebra", code: "z" },
				{ name: "alpha", code: "a" },
			],
			"/proj/src/snippets.gen.ts",
		);

		expect(out.indexOf('"alpha"')).toBeLessThan(out.indexOf('"zebra"'));
	});

	test("empty input still produces a valid module", () => {
		const out = generateSnippetsFile([], "/proj/src/snippets.gen.ts");
		expect(out).toContain("export const snippets = {");
		expect(out).toContain("} as const satisfies SnippetMap");
	});
});
