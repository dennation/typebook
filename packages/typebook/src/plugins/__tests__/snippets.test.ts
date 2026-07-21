import { describe, expect, test } from "vitest";
import { applyEdits, type Edit, parseProgram } from "../../scanner";
import type { TransformCtx } from "../../types";
import { SnippetNotInlineError, snippets } from "../snippets";

/** Build a TransformCtx over `code` that collects edits (no TS client — inline snippets only). */
async function runSnippets(code: string): Promise<string> {
	const edits: Edit[] = [];
	const ctx: TransformCtx = {
		code,
		filePath: "/x/demo.tsx",
		program: await parseProgram("/x/demo.tsx", code),
		tsClient: null,
		inject: (at, text) => edits.push({ at, insert: text }),
		addWatchFile: () => {},
	};
	await snippets().transform?.(ctx);
	return applyEdits(code, edits);
}

const IMPORT = 'import { Snippet } from "@dennation/typebook/react";\n';

describe("snippets() plugin", () => {
	test("injects __snippetSource for an inline snippet", async () => {
		const out = await runSnippets(
			`${IMPORT}export const demo = <Snippet name="x">{() => <button>Hi</button>}</Snippet>;`,
		);
		expect(out).toContain('__snippetSource={"<button>Hi</button>"}');
	});

	test("skips modules without a Snippet (mayTransform gate)", () => {
		expect(snippets().mayTransform?.("const x = 1;")).toBe(false);
		expect(snippets().mayTransform?.("<Snippet>{() => null}</Snippet>")).toBe(
			true,
		);
	});

	test("throws SnippetNotInlineError for a non-inline child", async () => {
		await expect(
			runSnippets(
				`${IMPORT}export const demo = <Snippet>{Component}</Snippet>;`,
			),
		).rejects.toBeInstanceOf(SnippetNotInlineError);
	});
});
