import { describe, expect, test } from "vitest";
import { parseProgram } from "../ast";
import { mayContainSnippet, scanSnippets } from "../snippet-scanner";

/** Parse then scan, mirroring how the plugin feeds a pre-parsed program + source. */
async function scan(filename: string, content: string) {
	return scanSnippets(await parseProgram(filename, content), content);
}

describe("mayContainSnippet", () => {
	test("detects Snippet substring", () => {
		expect(mayContainSnippet('<Snippet name="x">{() => <i/>}</Snippet>')).toBe(
			true,
		);
	});

	test("returns false when Snippet absent", () => {
		expect(mayContainSnippet("const x = 1")).toBe(false);
	});
});

describe("scanSnippets — inline function child", () => {
	test("arrow with expression body → the returned JSX (dedented)", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				function Page() {
					return (
						<Snippet name="hello">
							{() => <Button>Click</Button>}
						</Snippet>
					)
				}
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("hello");
		expect(result[0].code).toBe("<Button>Click</Button>");
	});

	test("records injectAt just after the opening tag name", async () => {
		const content = `
			import { Snippet } from '@dennation/typebook/react'
			const x = <Snippet name="x">{() => <i/>}</Snippet>
		`;
		const [block] = await scan("file.tsx", content);

		expect(typeof block.injectAt).toBe("number");
		// the 7 characters ending at injectAt spell "Snippet"
		expect(content.slice(block.injectAt - 7, block.injectAt)).toBe("Snippet");
	});

	test("parenthesised multi-line expression body keeps relative indentation", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = (
					<Snippet name="multi">
						{() => (
							<div>
								<span>nested</span>
							</div>
						)}
					</Snippet>
				)
			`,
		);

		expect(result[0].code).toBe("<div>\n  <span>nested</span>\n</div>");
	});

	test("expression body whose opening element starts mid-line is still dedented", async () => {
		// Mirrors an upstream transform (e.g. TanStack Router's code-splitter) that collapses
		// `() => (\n  <div…` into `() => <div…`, pulling the opening element onto the arrow line so
		// the slice begins at column zero. The common indent must come from the remaining lines.
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = (
					<Snippet name="midline">
						{() => <div>
								<span>nested</span>
							</div>}
					</Snippet>
				)
			`,
		);

		expect(result[0].code).toBe("<div>\n  <span>nested</span>\n</div>");
	});

	test("block body → statements with braces stripped (hooks example)", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = (
					<Snippet name="counter">
						{function Counter() {
							const [n, setN] = useState(0)
							return <Button onClick={() => setN(n + 1)}>{n}</Button>
						}}
					</Snippet>
				)
			`,
		);

		expect(result[0].code).toBe(
			"const [n, setN] = useState(0)\nreturn <Button onClick={() => setN(n + 1)}>{n}</Button>",
		);
	});

	test("captures name from an expression container", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet name={'expr'}>{() => <i/>}</Snippet>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("expr");
	});
});

describe("scanSnippets — source={ref} form", () => {
	test("captures a source identifier (name + offset) and skips inline slicing", async () => {
		const content = `
				import { Snippet } from '@dennation/typebook/react'
				import { ButtonDemo } from './demos'
				const x = (
					<Snippet source={ButtonDemo}>
						{({ preview, source }) => <div>{preview}{source}</div>}
					</Snippet>
				)
			`;
		const [block] = await scan("file.tsx", content);

		expect(block.sourceRef).not.toBeNull();
		expect(block.sourceRef?.name).toBe("ButtonDemo");
		// The offset points at the identifier inside `source={…}`.
		expect(
			content.slice(block.sourceRef!.offset, block.sourceRef!.offset + 10),
		).toBe("ButtonDemo");
		// With a source ref, the render-prop child is NOT sliced as the demo body.
		expect(block.code).toBeNull();
	});

	test("source ref still records injectAt after the tag name", async () => {
		const content = `
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet source={Demo}>{(s) => s.preview}</Snippet>
			`;
		const [block] = await scan("file.tsx", content);

		expect(block.sourceRef?.name).toBe("Demo");
		expect(content.slice(block.injectAt - 7, block.injectAt)).toBe("Snippet");
	});

	test("non-identifier source (member expression) → no ref, falls back to inline child", async () => {
		const [block] = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet source={demos.button}>{() => <i/>}</Snippet>
			`,
		);

		expect(block.sourceRef).toBeNull();
		expect(block.code).toBe("<i/>");
	});
});

describe("scanSnippets — non-inline child → code null (a build error)", () => {
	test("bare component reference is rejected", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				import { Counter } from './Counter'
				const x = <Snippet name="ref">{Counter}</Snippet>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("ref");
		expect(result[0].code).toBeNull();
	});

	test("raw JSX child is rejected", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet name="raw"><Button/></Snippet>
			`,
		);

		expect(result[0].code).toBeNull();
	});

	test("self-closing Snippet is rejected (no function child)", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet name="empty" />
			`,
		);

		expect(result[0].code).toBeNull();
	});
});

describe("scanSnippets — discovery rules", () => {
	test("aliased import is still captured", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet as Code } from '@dennation/typebook/react'
				const x = <Code name="aliased">{() => <i/>}</Code>
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
				const a = <Snippet name="one">{() => <i/>}</Snippet>
				const b = <Snippet name="two">{() => <i/>}</Snippet>
			`,
		);

		expect(result.map((b) => b.name).sort()).toEqual(["one", "two"]);
	});

	test("Snippet without a name is still captured (name now optional)", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const x = <Snippet>{() => <i/>}</Snippet>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBeNull();
		expect(result[0].code).toBe("<i/>");
	});

	test("dynamic (non-static) name is captured with name null", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from '@dennation/typebook/react'
				const id = 'x'
				const node = <Snippet name={id}>{() => <i/>}</Snippet>
			`,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBeNull();
	});

	test("Snippet imported from another package is ignored", async () => {
		const result = await scan(
			"file.tsx",
			`
				import { Snippet } from 'some-other-lib'
				const x = <Snippet name="nope">{() => <i/>}</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("no Snippet import → empty result", async () => {
		const result = await scan(
			"file.tsx",
			`
				const x = <Snippet name="nope">{() => <i/>}</Snippet>
			`,
		);

		expect(result).toEqual([]);
	});

	test("empty file → empty result", async () => {
		const result = await scan("file.tsx", "");
		expect(result).toEqual([]);
	});
});
