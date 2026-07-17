import path from "node:path";
import type { ComponentInfo, GenerateCtx, TypebookPlugin } from "../../types";
import type { PropFilter } from "./filterProps";
import { type LlmFormat, markdownFormat } from "./markdownFormat";

export {
	DEFAULT_HIDDEN_GROUPS,
	DEFAULT_KEPT_PROPS,
	DEFAULT_PROP_FILTER,
	hideGroups,
	type PropFilter,
} from "./filterProps";
export {
	type LlmFormat,
	type MarkdownFormatOptions,
	markdownFormat,
} from "./markdownFormat";

export interface LlmInstructionsOptions {
	/**
	 * Where each component's Markdown card goes. A **string** is a directory —
	 * `{out}/{name}.md`. A **function** returns the full path per component, so cards can
	 * sit next to their source: `(doc) => doc.file.replace(/\.tsx$/, ".md")`.
	 */
	out: string | ((doc: ComponentInfo) => string);
	/** Index file in `llms.txt` format, listing every component; `false` to skip it. */
	indexFile: string | false;
	/**
	 * Which components get a card (and an index entry) — `(component) => boolean`, `true` keeps it.
	 * Runs before `format`, so a dropped component produces nothing. Use it to hide deprecated
	 * components (`(c) => c.deprecated === undefined`) or re-exports you don't own. Defaults to
	 * keeping every scanned component.
	 */
	filterComponents?: (component: ComponentInfo) => boolean;
	/**
	 * Module each component is imported from — used to print an `import { X } from "…"` line in
	 * every card (agents need the exact import). A string (`"@acme/ui"`) or a function per component.
	 * Omit to skip the import line.
	 */
	importFrom?: string | ((doc: ComponentInfo) => string);
	/**
	 * Which props each card surfaces. Defaults to `DEFAULT_PROP_FILTER` (hides
	 * `DEFAULT_HIDDEN_GROUPS`). Pass `hideGroups` to change the group set, or any
	 * `(prop, component) => boolean` for arbitrary rules. Configures the default {@link markdownFormat}
	 * only — ignored when a custom `format` is given.
	 */
	filterProps?: PropFilter;
	/**
	 * How each scanned component becomes its instruction file — `(component) => string`. Defaults to
	 * {@link markdownFormat} (the Markdown card). `importFrom`/`filterProps` configure that default;
	 * a custom `format` receives the full {@link ComponentInfo} and owns the output — emit JSON, MDX,
	 * a different Markdown layout, anything.
	 */
	format?: LlmFormat;
	/** H1 title of the index / full file. Default: `"Components"`. */
	title?: string;
	/** Blockquote summary under the title (the `llms.txt` project summary). Optional. */
	description?: string;
}

/**
 * `typebook()` sub-plugin: writes AI-agent docs from the component scan, following the
 * [`llms.txt`](https://llmstxt.org) convention — one Markdown card per component (import,
 * description, usage guidance, deprecation, props table) plus an `llms.txt` index.
 * Regenerated in full on every scan (build once, dev on change).
 *
 * Output locations are explicit: `out` and `indexFile` are required (pass `false` to
 * `indexFile` to skip the index) — the plugin writes nowhere by default.
 */
export function llmInstructions(
	options: LlmInstructionsOptions,
): TypebookPlugin {
	const {
		out,
		indexFile,
		importFrom,
		filterProps,
		filterComponents,
		format = markdownFormat({ importFrom, filterProps }),
		title = "Components",
		description,
	} = options;

	const cardPath = (doc: ComponentInfo): string =>
		typeof out === "function"
			? out(doc)
			: `${out}/${safeFileName(doc.name)}.md`;

	return {
		name: "llm-instructions",
		async generate(allDocs, ctx) {
			const docs = filterComponents
				? allDocs.filter(filterComponents)
				: allDocs;
			await Promise.all(
				docs.map((doc) => ctx.writeFile(cardPath(doc), format(doc))),
			);
			if (indexFile !== false)
				await ctx.writeFile(
					indexFile,
					buildIndex(docs, indexFile, cardPath, ctx, title, description),
				);
		},
	};
}

/** The `llms.txt` index: H1 + blockquote summary + a `[name](href): desc` list, sorted by name. */
function buildIndex(
	docs: ComponentInfo[],
	indexFile: string,
	cardPath: (doc: ComponentInfo) => string,
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
			// Normalise the OS path separator to "/" — a Markdown link is a URL, and a
			// backslash href (`components\Button.md` on Windows) would not resolve.
			const href = path
				.relative(indexDir, abs(cardPath(doc)))
				.replaceAll(path.sep, "/");
			const summary = firstLine(doc.description) || doc.name;
			const deprecated = doc.deprecated !== undefined ? " (deprecated)" : "";
			return `- [${doc.name}](${href}): ${summary}${deprecated}`;
		});

	return `${heading(title, description)}## Components\n\n${lines.join("\n")}\n`;
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
