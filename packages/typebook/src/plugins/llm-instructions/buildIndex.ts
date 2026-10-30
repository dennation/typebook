import path from "node:path";
import { compareStrings } from "../../scanner/compareStrings";
import type { ComponentInfo, ModuleInfo } from "../../types";
import { importStatement } from "./importStatement";
import type { MarkdownFormatOptions } from "./markdownFormat";

export interface IndexOptions {
	indexName: string;
	title: string;
	description: string | undefined;
	importFrom: MarkdownFormatOptions["importFrom"];
	root: string;
}

/**
 * The module index: H1 + optional blockquote summary + one line per module, sorted by module name.
 * Each line links the module's card under its ready-made import, so the whole index can sit in an
 * agent's context and answer "what can I import, from where" without opening a card.
 */
export function buildIndex(
	names: Map<ModuleInfo, string>,
	options: IndexOptions,
): string {
	const { indexName, title, description, importFrom, root } = options;
	const indexDir = path.dirname(indexName);

	const lines = [...names]
		.map(([module, name]) => ({
			module,
			// Relative to the index, so the whole directory stays copyable. "/" not the OS separator:
			// a Markdown link is a URL.
			href: path.relative(indexDir, name).replaceAll(path.sep, "/"),
		}))
		// Code-unit order, not `localeCompare` (locale-dependent); the href breaks a tie between
		// same-named modules in different folders.
		.sort(
			(a, b) =>
				compareStrings(a.module.name, b.module.name) ||
				compareStrings(a.href, b.href),
		)
		.map(({ module, href }) =>
			indexLine(module, href, importStatement(importFrom, module, root)),
		);

	return `${heading(title, description)}${lines.join("\n")}\n`;
}

/** `` - [`import …`](href) — summary · parts: A, B · deprecated ``, each tail only when it applies. */
function indexLine(
	module: ModuleInfo,
	href: string,
	statement: string | undefined,
): string {
	const summary = firstLine(module.description);
	const allDeprecated = module.components.every(isDeprecated);
	// Only names the import hides — compound members (`Form.Root` behind `Form`); the rest are
	// already on the line.
	const parts = module.components
		.filter((c) => !module.bindings.includes(c.name))
		.map((c) =>
			!allDeprecated && isDeprecated(c) ? `${c.name} (deprecated)` : c.name,
		);

	return [
		`- [\`${statement ?? module.bindings.join(", ")}\`](${href})`,
		summary && `— ${summary}`,
		parts.length > 0 && `· parts: ${parts.join(", ")}`,
		allDeprecated && "· deprecated",
	]
		.filter(Boolean)
		.join(" ");
}

function isDeprecated(component: ComponentInfo): boolean {
	return component.deprecated !== undefined;
}

/** `# title` + optional `> description` blockquote (the index header). */
function heading(title: string, description: string | undefined): string {
	return description ? `# ${title}\n\n> ${description}\n\n` : `# ${title}\n\n`;
}

/** The description's first line without its closing period — it continues into the line's tail. */
function firstLine(text: string | undefined): string {
	const line = text?.split("\n")[0].trim() ?? "";
	return line.endsWith(".") ? line.slice(0, -1) : line;
}
