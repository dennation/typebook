import path from "node:path";
import { componentToMarkdown } from "../scanner";
import type { ComponentDoc, GenerateCtx, TypebookPlugin } from "../types";

export interface LlmInstructionsOptions {
	/**
	 * Where each component's Markdown card goes. A **string** is a directory —
	 * `{out}/{name}.md`. A **function** returns the full path per component, so cards can
	 * sit next to their source: `(doc) => doc.file.replace(/\.tsx$/, ".md")`.
	 */
	out?: string | ((doc: ComponentDoc) => string);
	/**
	 * Module each component is imported from — used to print an `import { X } from "…"` line in
	 * every card (agents need the exact import). A string (`"@acme/ui"`) or a function per component.
	 * Omit to skip the import line.
	 */
	importFrom?: string | ((doc: ComponentDoc) => string);
	/** H1 title of the index / full file. Default: `"Components"`. */
	title?: string;
	/** Blockquote summary under the title (the `llms.txt` project summary). Optional. */
	description?: string;
	/** Index file in `llms.txt` format, listing every component (default: `llms.txt` in `out`). `false` to skip. */
	indexFile?: string | false;
	/** Single concatenated file with every card (`llms-full.txt`, default: in `out`). `false` to skip. */
	fullFile?: string | false;
	/** Include framework-inherited props (DOM attributes) in each card. Default: false. */
	includeInherited?: boolean;
}

const DEFAULT_DIR = ".ai/components";

/**
 * `typebook()` sub-plugin: writes AI-agent docs from the component scan, following the
 * [`llms.txt`](https://llmstxt.org) convention — one Markdown card per component (import,
 * description, usage guidance, deprecation, props table), an `llms.txt` index, and a single
 * `llms-full.txt`. Regenerated in full on every scan (build once, dev on change).
 */
export function llmInstructions(
	options: LlmInstructionsOptions = {},
): TypebookPlugin {
	const {
		out = DEFAULT_DIR,
		importFrom,
		title = "Components",
		description,
		includeInherited,
	} = options;
	const baseDir = typeof out === "string" ? out : DEFAULT_DIR;

	const cardPath = (doc: ComponentDoc): string =>
		typeof out === "function"
			? out(doc)
			: `${out}/${safeFileName(doc.name)}.md`;
	const importStatement = (doc: ComponentDoc): string | undefined => {
		const src = typeof importFrom === "function" ? importFrom(doc) : importFrom;
		return src ? `import { ${doc.name} } from "${src}";` : undefined;
	};
	const renderCard = (doc: ComponentDoc): string =>
		componentToMarkdown(doc, {
			includeInherited,
			importStatement: importStatement(doc),
		});

	const indexFile = options.indexFile ?? `${baseDir}/llms.txt`;
	const fullFile = options.fullFile ?? `${baseDir}/llms-full.txt`;

	return {
		name: "llm-instructions",
		async generate(docs, ctx) {
			await Promise.all(
				docs.map((doc) => ctx.writeFile(cardPath(doc), renderCard(doc))),
			);
			if (indexFile !== false)
				await ctx.writeFile(
					indexFile,
					buildIndex(docs, indexFile, cardPath, ctx, title, description),
				);
			if (fullFile !== false)
				await ctx.writeFile(
					fullFile,
					buildFull(docs, renderCard, title, description),
				);
		},
	};
}

/** The `llms.txt` index: H1 + blockquote summary + a `[name](href): desc` list, sorted by name. */
function buildIndex(
	docs: ComponentDoc[],
	indexFile: string,
	cardPath: (doc: ComponentDoc) => string,
	ctx: GenerateCtx,
	title: string,
	description: string | undefined,
): string {
	const abs = (p: string): string =>
		path.isAbsolute(p) ? p : path.join(ctx.root, p);
	const indexDir = path.dirname(abs(indexFile));

	const lines = [...docs]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((doc) => {
			const href = path.relative(indexDir, abs(cardPath(doc)));
			const summary = firstLine(doc.description) || doc.name;
			const deprecated = doc.deprecated !== undefined ? " (deprecated)" : "";
			return `- [${doc.name}](${href}): ${summary}${deprecated}`;
		});

	return `${heading(title, description)}## Components\n\n${lines.join("\n")}\n`;
}

/** `llms-full.txt`: title + every card concatenated, for full-context ingestion. */
function buildFull(
	docs: ComponentDoc[],
	renderCard: (doc: ComponentDoc) => string,
	title: string,
	description: string | undefined,
): string {
	const cards = [...docs]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(renderCard)
		.join("\n\n");
	return `${heading(title, description)}${cards}\n`;
}

/** `# title` + optional `> description` blockquote (the `llms.txt` header). */
function heading(title: string, description: string | undefined): string {
	return description ? `# ${title}\n\n> ${description}\n\n` : `# ${title}\n\n`;
}

function firstLine(text: string | undefined): string {
	return text?.split("\n")[0].trim() ?? "";
}

/** Keep a component name safe as a filename (generics, spaces, punctuation → `_`). */
function safeFileName(name: string): string {
	return name.replace(/[^\w.-]+/g, "_");
}
