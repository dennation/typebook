import { describe, expect, test } from "vitest";
import { llmInstructions } from "../llm-instructions";
import type { ComponentInfo, GenerateCtx } from "../../types";

const doc: ComponentInfo = {
	name: "Button",
	file: "/x/Button.tsx",
	props: [
		{ name: "variant", optional: true, type: { kind: "string" } }, // own
		{
			name: "aria-label",
			optional: true,
			type: { kind: "string" },
			group: "aria",
			inheritedFrom: "@types/react",
		},
		{
			name: "onClick",
			optional: true,
			type: { kind: "function", raw: "() => void" },
			group: "event:mouse",
			inheritedFrom: "@types/react",
		},
	],
};

/** Run the plugin against one doc and return the written files by path. */
async function run(options: Parameters<typeof llmInstructions>[0]) {
	const files: Record<string, string> = {};
	const ctx: GenerateCtx = {
		command: "build",
		root: "/",
		writeFile: async (p, c) => {
			files[p] = c;
		},
	};
	await llmInstructions(options).generate([doc], ctx);
	return files;
}

describe("llmInstructions: prop policy", () => {
	test("a card hides default-hidden groups, keeps own + interaction events", async () => {
		const files = await run({ out: "out", indexFile: false });
		const card = files["out/Button.md"];

		expect(card).toContain("`variant`"); // own
		expect(card).toContain("`onClick`"); // event:mouse (shown)
		expect(card).not.toContain("`aria-label`"); // aria (hidden by default)
	});

	test("props.hiddenGroups overrides the default", async () => {
		const files = await run({
			out: "out",
			indexFile: false,
			props: { hiddenGroups: [] }, // hide nothing → aria now shows
		});
		expect(files["out/Button.md"]).toContain("`aria-label`");
	});
});
