import type { ModuleInfo } from "../../types";
import { componentToMarkdown } from "./componentToMarkdown";

/**
 * Render a {@link ModuleInfo} as one self-contained Markdown card — the `@module` prose, the import
 * line, its examples, then every component as a part. Intended as AI-agent context, so it stays
 * plain and link-free; the same layout whether the module holds one component or ten.
 */
export function moduleToMarkdown(
	module: ModuleInfo,
	options: { importStatement?: string } = {},
): string {
	const parts = [`## ${module.name}`];
	if (module.description) parts.push(module.description);
	if (options.importStatement) parts.push(tsx(`${options.importStatement};`));
	if (module.examples?.length)
		parts.push("**Example**", ...module.examples.map(fenced));
	parts.push(...module.components.map((c) => componentToMarkdown(c)));

	return parts.join("\n\n");
}

/** An `@example` body as written when it brings its own fence, otherwise fenced as `tsx`. */
function fenced(body: string): string {
	return body.includes("```") ? body : tsx(body);
}

function tsx(code: string): string {
	return `\`\`\`tsx\n${code}\n\`\`\``;
}
