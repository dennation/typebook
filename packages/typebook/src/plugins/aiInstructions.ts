import path from "node:path";
import { componentToMarkdown } from "../scanner";
import type { ComponentDoc, GenerateCtx, TypebookPlugin } from "../types";

export interface AiInstructionsOptions {
	/**
	 * Where each component's Markdown card goes. A **string** is a directory —
	 * `{out}/{name}.md`. A **function** returns the full path per component, so cards can
	 * sit next to their source: `(doc) => doc.file.replace(/\.tsx$/, ".md")`.
	 */
	out?: string | ((doc: ComponentDoc) => string);
	/** Index file listing every component (default: `index.md` inside `out`). `false` to skip it. */
	indexFile?: string | false;
	/** Include framework-inherited props (DOM attributes) in each card. Default: false. */
	includeInherited?: boolean;
}

const DEFAULT_DIR = ".ai/components";

/**
 * `typebook()` sub-plugin: writes one Markdown card per component (props table +
 * component-level description / deprecation) plus an index, as context for AI agents
 * (Claude Code / Codex). Regenerated in full on every scan — build once, dev on change.
 */
export function aiInstructions(
	options: AiInstructionsOptions = {},
): TypebookPlugin {
	const { out = DEFAULT_DIR, includeInherited } = options;
	const cardPath = (doc: ComponentDoc): string =>
		typeof out === "function"
			? out(doc)
			: `${out}/${safeFileName(doc.name)}.md`;
	const indexFile =
		options.indexFile ??
		(typeof out === "string" ? `${out}/index.md` : `${DEFAULT_DIR}/index.md`);

	return {
		name: "ai-instructions",
		async generate(docs, ctx) {
			await Promise.all(
				docs.map((doc) =>
					ctx.writeFile(
						cardPath(doc),
						componentToMarkdown(doc, { includeInherited }),
					),
				),
			);
			if (indexFile !== false)
				await ctx.writeFile(
					indexFile,
					buildIndex(docs, indexFile, cardPath, ctx),
				);
		},
	};
}

/** A component index: a link + one-line summary per component, sorted by name. */
function buildIndex(
	docs: ComponentDoc[],
	indexFile: string,
	cardPath: (doc: ComponentDoc) => string,
	ctx: GenerateCtx,
): string {
	const abs = (p: string): string =>
		path.isAbsolute(p) ? p : path.join(ctx.root, p);
	const indexDir = path.dirname(abs(indexFile));

	const lines = [...docs]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((doc) => {
			const href = path.relative(indexDir, abs(cardPath(doc)));
			const summary = firstLine(doc.description);
			const deprecated = doc.deprecated !== undefined ? " ⚠️ deprecated" : "";
			return `- [${doc.name}](${href})${summary ? ` — ${summary}` : ""}${deprecated}`;
		});

	return `# Components\n\n${lines.join("\n")}\n`;
}

function firstLine(text: string | undefined): string {
	return text?.split("\n")[0].trim() ?? "";
}

/** Keep a component name safe as a filename (generics, spaces, punctuation → `_`). */
function safeFileName(name: string): string {
	return name.replace(/[^\w.-]+/g, "_");
}
