import { describe, expect, test } from "vitest";
import type { ComponentInfo } from "../../types";
import { componentToMarkdown } from "../llm-instructions/componentToMarkdown";

// --- componentToMarkdown: pure rendering (the llm-instructions card) ---

describe("componentToMarkdown", () => {
	const doc: ComponentInfo = {
		name: "Button",
		file: "/x/Button.tsx",
		description: "Primary action button.",
		remarks: "Use for the main action; don't nest buttons.",
		deprecated: "use `Action`",
		props: [
			{
				name: "size",
				optional: false,
				type: { kind: "literal", values: ["sm", "md"] },
				defaultValue: "'md'",
				description: "Button size",
			},
			{
				name: "onClick",
				optional: true,
				type: { kind: "function", raw: "() => void" },
			},
			{
				name: "className",
				optional: true,
				type: { kind: "string" },
				inheritedFrom: "@types/react",
			},
		],
	};

	test("renders heading, description, deprecation note", () => {
		const md = componentToMarkdown(doc);
		expect(md).toContain("## Button");
		expect(md).toContain("Primary action button.");
		expect(md).toContain("> ⚠️ **Deprecated:** use `Action`");
	});

	test("renders a props table with type, default, required", () => {
		const md = componentToMarkdown(doc);
		expect(md).toContain(
			'| `size` | `"sm" \\| "md"` | `\'md\'` | ✔ | Button size |',
		);
	});

	test("hides inherited props by default, shows them on request", () => {
		expect(componentToMarkdown(doc)).not.toContain("`className`");
		expect(componentToMarkdown(doc, { includeInherited: true })).toContain(
			"`className`",
		);
	});

	test("renders the import statement and @remarks usage section", () => {
		const md = componentToMarkdown(doc, {
			importStatement: 'import { Button } from "@acme/ui";',
		});
		expect(md).toContain('import { Button } from "@acme/ui";');
		expect(md).toContain("**Usage**");
		expect(md).toContain("don't nest buttons");
	});
});
