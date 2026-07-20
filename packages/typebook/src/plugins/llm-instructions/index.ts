import path from "node:path";
import type { ComponentInfo, GenerateCtx, TypebookPlugin } from "../../types";
import type { PropFilter } from "./filterProps";
import {
	type EntryPathContext,
	type LlmFormat,
	markdownFormat,
} from "./markdownFormat";

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
	type EntryPathContext,
	type LlmFormat,
	type MarkdownFormatOptions,
	markdownFormat,
} from "./markdownFormat";

export interface LlmInstructionsOptions {
	/**
	 * The full path of each component's card — you build it, so the filename is explicit and nothing
	 * is appended. Gets the component (its folder is `component.dir`) and `{ root }`; return an
	 * absolute path (a relative one resolves against `root`):
	 * - next to the component — `(c) => path.join(c.dir, c.name + ".md")`
	 * - from the project root — `(c, { root }) => path.join(root, "docs", c.name + ".md")`
	 */
	entryPath: (component: ComponentInfo, ctx: EntryPathContext) => string;
	/**
	 * The Markdown index listing every component (with a link to each card), relative to the project
	 * root; `false` to skip it. Reference it from your `AGENTS.md` / `CLAUDE.md` so an agent finds it.
	 */
	indexPath: string | false;
	/**
	 * Which components get a card (and an index entry) — `(component) => boolean`, `true` keeps it.
	 * Runs before `format`, so a dropped component produces nothing. Use it to hide deprecated
	 * components (`(c) => c.deprecated === undefined`) or re-exports you don't own. Defaults to
	 * keeping every scanned component.
	 */
	filterComponents?: (component: ComponentInfo) => boolean;
	/**
	 * Module each component is imported from — prints an `import { X } from "…"` line in every card
	 * (agents need the exact import). A string (`"@acme/ui"`), or a function that gets the same
	 * `{ root }` as `entryPath` — e.g. derive a subpath from where the component lives:
	 * `(c, { root }) => `@acme/ui/${path.relative(root, c.dir)}``. Omit to skip it.
	 */
	importFrom?:
		| string
		| ((component: ComponentInfo, ctx: EntryPathContext) => string);
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
	/** H1 title of the index. Default: `"Components"`. */
	title?: string;
	/** Blockquote summary under the index title. Optional. */
	description?: string;
	/**
	 * Also emit a **published copy** into the bundler's output directory — `build` only, ignored in
	 * dev. The main `entryPath`/`indexPath` output is your committed-in-source copy (for review); this
	 * is the copy that ships. `true` writes to the output dir's root, a string to a subdirectory of it.
	 * Flat layout: `{component.name}.md` per component + `index.md`, same content as the main output.
	 * Default `false`. If the output directory is unknown (a non-Vite bundler), it warns and skips
	 * (fails when `failOnError` is set).
	 */
	emitToOutDir?: boolean | string;
}

/**
 * `typebook()` sub-plugin: writes AI-agent docs from the component scan — one Markdown card per
 * component (import, description, usage guidance, deprecation, props table) plus a Markdown index
 * linking them all. Regenerated in full on every scan (build once, dev on change).
 *
 * Output locations are explicit: `entryPath` and `indexPath` are required (pass `false` to
 * `indexPath` to skip it) — the plugin writes nowhere by default.
 */
export function llmInstructions(
	options: LlmInstructionsOptions,
): TypebookPlugin {
	const {
		entryPath,
		indexPath,
		importFrom,
		filterProps,
		keepOwnProps,
		filterComponents,
		format,
		title = "Components",
		description,
		emitToOutDir = false,
	} = options;

	return {
		name: "llm-instructions",
		async generate(allComponents, ctx) {
			const components = filterComponents
				? allComponents.filter(filterComponents)
				: allComponents;
			// Built here (not at plugin init) so the default format can pass `ctx.root` to an
			// `importFrom` function; a custom `format` owns its output and gets neither.
			const render =
				format ??
				markdownFormat({
					importFrom,
					filterProps,
					keepOwnProps,
					root: ctx.root,
				});
			// `entryPath` builds the full path (the component's folder is `component.dir`); a relative
			// return resolves against the project root.
			const cardPath = (component: ComponentInfo): string => {
				const p = entryPath(component, { root: ctx.root });
				return path.isAbsolute(p) ? p : path.join(ctx.root, p);
			};
			await Promise.all(
				components.map((component) =>
					ctx.writeFile(cardPath(component), render(component)),
				),
			);
			if (indexPath !== false)
				await ctx.writeFile(
					indexPath,
					buildIndex(components, indexPath, cardPath, ctx, title, description),
				);

			// Optional published copy in the build output dir — same content, flat layout, so it
			// survives `emptyOutDir` (the factory runs `generate` at `writeBundle` in build).
			if (emitToOutDir !== false && ctx.command === "build") {
				if (!ctx.outDir)
					throw new Error(
						"emitToOutDir is set but the bundler's output directory is unknown (only Vite exposes it)",
					);
				const base =
					typeof emitToOutDir === "string"
						? path.join(ctx.outDir, emitToOutDir)
						: ctx.outDir;
				const outCardPath = (component: ComponentInfo): string =>
					path.join(base, `${component.name}.md`);
				await Promise.all(
					components.map((component) =>
						ctx.writeFile(outCardPath(component), render(component)),
					),
				);
				const outIndexPath = path.join(base, "index.md");
				await ctx.writeFile(
					outIndexPath,
					buildIndex(
						components,
						outIndexPath,
						outCardPath,
						ctx,
						title,
						description,
					),
				);
			}
		},
	};
}

/** The component index: H1 + blockquote summary + a `[name](href): desc` list, sorted by name. */
function buildIndex(
	components: ComponentInfo[],
	indexPath: string,
	cardPath: (component: ComponentInfo) => string,
	ctx: GenerateCtx,
	title: string,
	description: string | undefined,
): string {
	const abs = (p: string): string =>
		path.isAbsolute(p) ? p : path.join(ctx.root, p);
	const indexDir = path.dirname(abs(indexPath));

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

/** `# title` + optional `> description` blockquote (the index header). */
function heading(title: string, description: string | undefined): string {
	return description ? `# ${title}\n\n> ${description}\n\n` : `# ${title}\n\n`;
}

function firstLine(text: string | undefined): string {
	return text?.split("\n")[0].trim() ?? "";
}
