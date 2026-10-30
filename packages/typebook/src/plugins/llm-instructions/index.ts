import path from "node:path";
import { LOG_PREFIX } from "../../constants";
import { moduleBindings } from "../../scanner/moduleBindings";
import type {
	CommandCtx,
	ComponentInfo,
	ModuleInfo,
	TypebookPlugin,
} from "../../types";
import { buildIndex } from "./buildIndex";
import { diffFiles, type FileMap, normalize, writeFiles } from "./files";
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
	 * Filename of the Markdown index listing every module. Default `"index.md"`; `false` skips it.
	 * Reference it from your `AGENTS.md` / `CLAUDE.md` so an agent finds the cards.
	 */
	indexName?: string | false;
	/**
	 * Filename of a module's card, relative to {@link outDir} — default `` `${module.name}.md` `` (the
	 * name of the scanned file's folder). Gets the same `{ root }` as `importFrom` (the module's own
	 * folder is `module.dir`), so it can mirror your source layout:
	 * `` (m, { root }) => `${path.relative(root, m.dir)}.md` ``. May nest, but may not escape the
	 * directory — that is what keeps the output copyable as a unit.
	 */
	fileName?: (module: ModuleInfo, ctx: ImportFromContext) => string;
	/**
	 * Which components are documented (`true` keeps). Applied before grouping: a module left with
	 * no components gets no card and no index line, and its import drops the bindings filtered out.
	 */
	filterComponents?: (component: ComponentInfo) => boolean;
	/**
	 * Where each module is imported from — prints one `import { A, B } from "…"` line with all of the
	 * module's bindings, in its card and as its index link (agents need the exact import). A string
	 * (`"@acme/ui"`), or a function that gets `{ root }` — e.g. derive a subpath from where the
	 * module lives: `(m, { root }) => `@acme/ui/${path.relative(root, m.dir)}``. Omit to skip it.
	 */
	importFrom?:
		| string
		| ((module: ModuleInfo, ctx: ImportFromContext) => string);
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
	 * How each module becomes its instruction file — `(module) => string`. Defaults to
	 * {@link markdownFormat} (the Markdown card). `importFrom`/`filterProps` configure that default;
	 * a custom `format` receives the full {@link ModuleInfo} (filtered by `filterComponents`) and
	 * owns the output — emit JSON, MDX, a different Markdown layout, anything.
	 */
	format?: LlmFormat;
	/** H1 title of the index. Default: `"Components"`. */
	title?: string;
	/** Blockquote summary under the index title. Optional. */
	description?: string;
}

/**
 * `typebook()` sub-plugin: AI-agent docs from the component scan — one Markdown card per module
 * (the components of one scanned file: `@module` prose, import, examples, then each component's
 * description, usage guidance, deprecation and props table) plus a Markdown index with one line per
 * module. Regenerated in full on every scan (build once, dev on change).
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
	const build = (ctx: CommandCtx) =>
		buildFiles(options, ctx).then((files) => ({
			files,
			dir: absolute(options.outDir, ctx.root),
		}));

	return {
		name: "llm-instructions",
		commands: {
			"llm-instructions:generate": {
				describe: "write the module cards and their index",
				async run(ctx) {
					const { files, dir } = await build(ctx);
					const { extra } = await diffFiles(files, dir);
					await writeFiles(files, dir);
					console.log(
						LOG_PREFIX,
						`wrote ${files.size} file(s)` +
							(extra.length ? `, removed ${extra.length}` : ""),
					);
				},
			},
			"llm-instructions:check": {
				describe: "fail if the cards are out of date, writing nothing",
				async run(ctx) {
					const { files, dir } = await build(ctx);
					const { stale, extra } = await diffFiles(files, dir);
					if (stale.length === 0 && extra.length === 0) {
						console.log(LOG_PREFIX, `${files.size} file(s) up to date`);
						return;
					}
					const rel = (file: string) => `  ${path.relative(ctx.root, file)}`;
					throw new StaleCardsError(
						[
							`${stale.length + extra.length} file(s) out of date — run \`llm-instructions:generate\`:`,
							...stale.map(rel),
							// A card nobody produced is just as wrong: an agent would read documentation
							// for a component that no longer exists.
							...extra.map((file) => `${rel(file)} (no longer generated)`),
						].join("\n"),
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
		fileName = (module: ModuleInfo) => `${module.name}.md`,
		importFrom,
		filterProps,
		keepOwnProps,
		filterComponents,
		format,
		title = "Components",
		description,
	} = options;

	const modules = (await ctx.modules()).flatMap((module) => {
		if (!filterComponents) return [module];
		const components = module.components.filter(filterComponents);
		return components.length > 0
			? [{ ...module, components, bindings: moduleBindings(components) }]
			: [];
	});
	// Built here (not at plugin init) so the default format can pass `ctx.root` to an
	// `importFrom` function; a custom `format` owns its output and gets neither.
	const render =
		format ??
		markdownFormat({ importFrom, filterProps, keepOwnProps, root: ctx.root });

	const dir = absolute(outDir, ctx.root);
	const names = assignNames(modules, fileName, ctx.root, indexName);

	const files: FileMap = new Map(
		[...names].map(([module, name]) => [
			path.join(dir, name),
			normalize(render(module)),
		]),
	);
	if (indexName !== false)
		files.set(
			path.join(dir, entry(indexName)),
			normalize(
				buildIndex(names, {
					indexName,
					title,
					description,
					importFrom,
					root: ctx.root,
				}),
			),
		);
	return files;
}

/**
 * Each module's filename, verified to be unique.
 *
 * Two same-named modules in different folders (`components/dialog`, `deprecated/dialog`) would
 * otherwise collapse onto one card: the last one silently wins, and the index lists both under the
 * same link — so an agent following the line for one gets the other's props. Wrong docs are worse
 * than none, so this fails instead, naming both and how to separate them.
 */
function assignNames(
	modules: ModuleInfo[],
	fileName: (module: ModuleInfo, ctx: ImportFromContext) => string,
	root: string,
	indexName: string | false,
): Map<ModuleInfo, string> {
	const names = new Map<ModuleInfo, string>();
	const taken = new Map<string, ModuleInfo | null>(
		indexName === false ? [] : [[entry(indexName), null]],
	);
	const where = (module: ModuleInfo | null): string =>
		module
			? `"${module.name}" (${path.relative(root, module.sourceFile)})`
			: "the index";

	for (const module of modules) {
		const name = entry(fileName(module, { root }));
		if (taken.has(name))
			throw new Error(
				`${where(taken.get(name) ?? null)} and ${where(module)} both map to "${name}" — ` +
					"give `fileName` something unique, e.g. mirror the source layout: " +
					'(m, { root }) => path.relative(root, m.dir) + ".md"',
			);
		taken.set(name, module);
		names.set(module, name);
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
