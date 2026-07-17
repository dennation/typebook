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
	type PropFilterFn,
	type PropFilterMap,
} from "./filterProps";
export {
	type LlmFormat,
	type MarkdownFormatOptions,
	markdownFormat,
} from "./markdownFormat";

export interface LlmInstructionsOptions {
	/**
	 * Where each component's card goes, **relative to the component's own folder** (the directory of
	 * its `sourceFile`). A **string** is a subdirectory — `{out}/{Name}.md` — so `"."` puts the card
	 * right next to the component and `"__llms__"` in a sibling folder. A **function** returns a path
	 * per component; a relative one resolves against the component's folder, an absolute one is used
	 * as-is.
	 */
	out: string | ((component: ComponentInfo) => string);
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
	importFrom?: string | ((component: ComponentInfo) => string);
	/**
	 * Which props each card surfaces — a {@link PropFilter}: a **map** (`{ element: false, href: true }`,
	 * keyed by group or prop name, prop name wins) or a **predicate** for arbitrary rules. Defaults to
	 * `DEFAULT_PROP_FILTER`; spread it to override (`{ ...DEFAULT_PROP_FILTER, formEncType: true }`).
	 * Configures the default {@link markdownFormat} only — ignored when a custom `format` is given.
	 */
	filterProps?: PropFilter;
	/**
	 * Keep a component's **own** props regardless of `filterProps`. Default `true` — a component's own
	 * API always shows; `false` filters own props too. Configures the default `format` only.
	 */
	keepOwnProps?: boolean;
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
		keepOwnProps,
		filterComponents,
		format = markdownFormat({ importFrom, filterProps, keepOwnProps }),
		title = "Components",
		description,
	} = options;

	// A card path resolves relative to the component's own folder (the dir of its `sourceFile`), so
	// `out: "."` puts the card next to the component; an absolute path is used as-is.
	const cardPath = (component: ComponentInfo): string => {
		const rel =
			typeof out === "function"
				? out(component)
				: `${out}/${safeFileName(component.name)}.md`;
		return path.isAbsolute(rel)
			? rel
			: path.join(path.dirname(component.sourceFile), rel);
	};

	return {
		name: "llm-instructions",
		async generate(allComponents, ctx) {
			const components = filterComponents
				? allComponents.filter(filterComponents)
				: allComponents;
			await Promise.all(
				components.map((component) =>
					ctx.writeFile(cardPath(component), format(component)),
				),
			);
			if (indexFile !== false)
				await ctx.writeFile(
					indexFile,
					buildIndex(components, indexFile, cardPath, ctx, title, description),
				);
		},
	};
}

/** The `llms.txt` index: H1 + blockquote summary + a `[name](href): desc` list, sorted by name. */
function buildIndex(
	components: ComponentInfo[],
	indexFile: string,
	cardPath: (component: ComponentInfo) => string,
	ctx: GenerateCtx,
	title: string,
	description: string | undefined,
): string {
	const abs = (p: string): string =>
		path.isAbsolute(p) ? p : path.join(ctx.root, p);
	const indexDir = path.dirname(abs(indexFile));

	const lines = [...components]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((component) => {
			// Normalise the OS path separator to "/" — a Markdown link is a URL, and a
			// backslash href (`components\Button.md` on Windows) would not resolve.
			const href = path
				.relative(indexDir, abs(cardPath(component)))
				.replaceAll(path.sep, "/");
			const summary = firstLine(component.description) || component.name;
			const deprecated =
				component.deprecated !== undefined ? " (deprecated)" : "";
			return `- [${component.name}](${href}): ${summary}${deprecated}`;
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
