import { describe, expect, test } from "vitest";
import { parseProgram } from "../ast.js";
import { mayContainSnippet, scanSnippets } from "../snippet-scanner.js";

/** Parse then scan, mirroring how the builder feeds a pre-parsed program + source. */
async function scan(filename: string, content: string) {
	return scanSnippets(await parseProgram(filename, content), content);
}

describe("mayContainSnippet", () => {
	test("detects Snippet substring", () => {
		expect(mayContainSnippet('<Snippet name="x">hi</Snippet>')).toBe(true);
	});

	test("returns false when Snippet absent", () => {
		expect(mayContainSnippet("const x = 1")).toBe(false);
	});
});

describe("scanSnippets — <Snippet> discovery", () => {
	test("extracts children source 1:1 (dedented) and the name", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				function Page() {
					return (
						<Snippet name="hello">
							<Button>Click</Button>
						</Snippet>
					)
				}
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("hello");
		expect(result[0].code).toBe("<Button>Click</Button>");
		expect(typeof result[0].start).toBe("number");
	});

	test("preserves multi-line structure and relative indentation", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = (
					<Snippet name="multi">
						<div>
							<span>nested</span>
						</div>
					</Snippet>
				)
			`,
		);

		expect(result[0].code).toBe("<div>\n  <span>nested</span>\n</div>");
	});

	test("captures name from an expression container", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet name={'expr'}>hi</Snippet>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("expr");
		expect(result[0].code).toBe("hi");
	});

	test("self-closing Snippet yields empty code", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet name="empty" />
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].code).toBe("");
	});

	test("aliased import is still captured", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet as Code } from '@dennation/typebook/react'
				const x = <Code name="aliased">hi</Code>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("aliased");
	});

	test("multiple snippets in one file", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const a = <Snippet name="one">1</Snippet>
				const b = <Snippet name="two">2</Snippet>
			`,
		);

		expect(result.map((b) => b.name).sort()).toEqual(["one", "two"]);
	});

	test("Snippet without a name is dropped", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet>hi</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("dynamic (non-static) name is dropped", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const id = 'x'
				const node = <Snippet name={id}>hi</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("Snippet imported from another package is ignored", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from 'some-other-lib'
				const x = <Snippet name="nope">hi</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("no Snippet import → empty result", async () => {
		const result = await scan(
			"file.tsx",
			`
				const x = <Snippet name="nope">hi</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("empty file → empty result", async () => {
		const result = await scan("file.tsx", "");
		expect(result).toEqual([]);
	});
});
