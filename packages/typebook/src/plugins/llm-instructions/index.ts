import path from "node:path";
import { LOG_PREFIX } from "../../constants";
import type { CommandCtx, ComponentInfo, TypebookPlugin } from "../../types";
import { type FileMap, normalize, staleFiles, writeFiles } from "./files";
import type { PropFilter } from "./filterProps";
import {
	type ImportFromContext,
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
	type ImportFromContext,
	type LlmFormat,
	type MarkdownFormatOptions,
	markdownFormat,
} from "./markdownFormat";

export interface LlmInstructionsOptions {
	/**
	 * The directory every file lands in — absolute, or relative to the project root. Cards go in its
	 * root and the index sits beside them, linking each card by a path relative to itself, so the
	 * directory is **self-contained**: copy or publish it anywhere and the links still resolve.
	 */
	outDir: string;
	/**
	 * Filename of the Markdown index listing every component. Default `"index.md"`; `false` skips it.
	 * Reference it from your `AGENTS.md` / `CLAUDE.md` so an agent finds the cards.
	 */
	indexName?: string | false;
	/**
	 * Filename of a component's card, relative to {@link outDir} — default `` `${component.name}.md` ``.
	 * Gets the same `{ root }` as `importFrom` (the component's own folder is `component.dir`), so it
	 * can mirror your source layout: `` (c, { root }) => `${path.relative(root, c.dir)}/${c.name}.md` ``.
	 * May nest, but may not escape the directory — that is what keeps the output copyable as a unit.
	 */
	fileName?: (component: ComponentInfo, ctx: ImportFromContext) => string;
	filterComponents?: (component: ComponentInfo) => boolean;
	/**
	 * Module each component is imported from — prints an `import { X } from "…"` line in every card
	 * (agents need the exact import). A string (`"@acme/ui"`), or a function that gets the same
	 * `{ root }` as `entryPath` — e.g. derive a subpath from where the component lives:
	 * `(c, { root }) => `@acme/ui/${path.relative(root, c.dir)}``. Omit to skip it.
	 */
	importFrom?:
		| string
		| ((component: ComponentInfo, ctx: ImportFromContext) => string);
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
}

/**
 * `typebook()` sub-plugin: AI-agent docs from the component scan — one Markdown card per component
 * (import, description, usage guidance, deprecation, props table) plus a Markdown index linking them
 * all. Regenerated in full on every scan (build once, dev on change).
 *
 * Everything lands in one `outDir`, with the index linking each card relative to itself — so the
 * directory is a self-contained unit you can copy into `dist`, publish with the package, or serve
 * as static files, and the links keep working. Need it in two places? That's a copy step in your
 * build, not an option here.
 *
 * Returns the files rather than writing them, so the caller decides: persist, compare, or assert.
 */
export function llmInstructions(
	options: LlmInstructionsOptions,
): TypebookPlugin {
	const build = (ctx: CommandCtx) => buildFiles(options, ctx);

	return {
		name: "llm-instructions",
		commands: {
			"llm-instructions:generate": {
				describe: "write the component cards and their index",
				async run(ctx) {
					const files = await build(ctx);
					await writeFiles(files);
					console.log(LOG_PREFIX, `wrote ${files.size} file(s)`);
				},
			},
			"llm-instructions:check": {
				describe: "fail if the cards are out of date, writing nothing",
				async run(ctx) {
					const files = await build(ctx);
					const stale = await staleFiles(files);
					if (stale.length === 0) {
						console.log(LOG_PREFIX, `${files.size} file(s) up to date`);
						return;
					}
					throw new StaleCardsError(
						`${stale.length} file(s) out of date — run \`llm-instructions:generate\`:\n` +
							stale
								.map((file) => `  ${path.relative(ctx.root, file)}`)
								.join("\n"),
					);
				},
			},
		},
	};
}

/** Thrown by `check` when the written cards no longer match the source. */
export class StaleCardsError extends Error {
	name = "StaleCardsError";
}

/** The cards and their index, as a {@link FileMap} — nothing is written here. */
async function buildFiles(
	options: LlmInstructionsOptions,
	ctx: CommandCtx,
): Promise<FileMap> {
	const {
		outDir,
		indexName = "index.md",
		fileName = (component: ComponentInfo) => `${component.name}.md`,
		importFrom,
		filterProps,
		keepOwnProps,
		filterComponents,
		format,
		title = "Components",
		description,
	} = options;

	const scanned = await ctx.components();
	const components = filterComponents
		? scanned.filter(filterComponents)
		: scanned;
	// Built here (not at plugin init) so the default format can pass `ctx.root` to an
	// `importFrom` function; a custom `format` owns its output and gets neither.
	const render =
		format ??
		markdownFormat({ importFrom, filterProps, keepOwnProps, root: ctx.root });

	const dir = absolute(outDir, ctx.root);
	const names = assignNames(components, fileName, ctx.root, indexName);

	const files: FileMap = new Map(
		[...names].map(([component, name]) => [
			path.join(dir, name),
			normalize(render(component)),
		]),
	);
	if (indexName !== false)
		files.set(
			path.join(dir, entry(indexName)),
			normalize(buildIndex(names, indexName, title, description)),
		);
	return files;
}

/**
 * Each component's filename, verified to be unique.
 *
 * Two same-named components in different folders (`forms/Button`, `toolbar/Button`) would otherwise
 * collapse onto one card: the last one silently wins, and the index lists both under the same link —
 * so an agent following the entry for one gets the other's props. Wrong docs are worse than none, so
 * this fails instead, naming both and how to separate them.
 */
function assignNames(
	components: ComponentInfo[],
	fileName: (component: ComponentInfo, ctx: ImportFromContext) => string,
	root: string,
	indexName: string | false,
): Map<ComponentInfo, string> {
	const names = new Map<ComponentInfo, string>();
	const taken = new Map<string, ComponentInfo | null>(
		indexName === false ? [] : [[entry(indexName), null]],
	);
	const where = (component: ComponentInfo | null): string =>
		component
			? `"${component.name}" (${path.relative(root, component.sourceFile)})`
			: "the index";

	for (const component of components) {
		const name = entry(fileName(component, { root }));
		if (taken.has(name))
			throw new Error(
				`${where(taken.get(name) ?? null)} and ${where(component)} both map to "${name}" — ` +
					"give `fileName` something unique, e.g. group by folder: " +
					'(c) => path.basename(c.dir) + "/" + c.name + ".md"',
			);
		taken.set(name, component);
		names.set(component, name);
	}
	return names;
}

/**
 * A filename validated to stay inside the output directory — the guarantee the whole layout rests
 * on. An absolute path or a `../` escape would break it silently at copy time, so it fails here.
 */
function entry(name: string): string {
	const normalised = path.normalize(name);
	if (path.isAbsolute(normalised) || normalised.startsWith(".."))
		throw new Error(
			`"${name}" escapes the output directory — a card's name must stay inside it`,
		);
	return normalised;
}

/** A path as given (absolute) or resolved against the project root. */
function absolute(target: string, root: string): string {
	return path.isAbsolute(target) ? target : path.join(root, target);
}

/** The component index: H1 + blockquote summary + a `[name](href): desc` list, sorted by name. */
function buildIndex(
	names: Map<ComponentInfo, string>,
	indexName: string,
	title: string,
	description: string | undefined,
): string {
	const indexDir = path.dirname(indexName);

	// Sorted by code unit, not `localeCompare` — the latter varies with the runtime's locale data,
	// which would reorder the index between machines for no reason.
	const lines = [...names]
		.sort(([a], [b]) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
		.map(([component, name]) => {
			// Relative to the index, which lives in the same directory — so the whole directory stays
			// copyable. "/" not the OS separator: a Markdown link is a URL.
			const href = path.relative(indexDir, name).replaceAll(path.sep, "/");
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
