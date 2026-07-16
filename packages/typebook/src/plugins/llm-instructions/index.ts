import path from "node:path";
import type { ComponentInfo, GenerateCtx, TypebookPlugin } from "../../types";
import { componentToMarkdown } from "./componentToMarkdown";
import { DEFAULT_PROP_FILTER, type PropFilter } from "./filterProps";

export {
	DEFAULT_HIDDEN_GROUPS,
	DEFAULT_KEPT_PROPS,
	DEFAULT_PROP_FILTER,
	hideGroups,
	type PropFilter,
} from "./filterProps";

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
	 * Module each component is imported from — used to print an `import { X } from "…"` line in
	 * every card (agents need the exact import). A string (`"@acme/ui"`) or a function per component.
	 * Omit to skip the import line.
	 */
	importFrom?: string | ((doc: ComponentInfo) => string);
	/**
	 * Which props each card surfaces. Defaults to {@link DEFAULT_PROP_FILTER} (hides
	 * {@link DEFAULT_HIDDEN_GROUPS}). Pass {@link hideGroups} to change the group set, or any
	 * `(prop, component) => boolean` for arbitrary rules.
	 */
	filterProps?: PropFilter;
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
		filterProps = DEFAULT_PROP_FILTER,
		title = "Components",
		description,
	} = options;

	const cardPath = (doc: ComponentInfo): string =>
		typeof out === "function"
			? out(doc)
			: `${out}/${safeFileName(doc.name)}.md`;
	const importStatement = (doc: ComponentInfo): string | undefined => {
		const src = typeof importFrom === "function" ? importFrom(doc) : importFrom;
		return src ? `import { ${doc.name} } from "${src}";` : undefined;
	};
	const renderCard = (doc: ComponentInfo): string =>
		componentToMarkdown(
			{ ...doc, props: doc.props.filter((p) => filterProps(p, doc)) },
			{ importStatement: importStatement(doc) },
		);

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
			const href = path.relative(indexDir, abs(cardPath(doc)));
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
