import type { ModuleInfo } from "../../types";
import {
	asPropFilterFn,
	DEFAULT_PROP_FILTER,
	type PropFilter,
} from "./filterProps";
import { importStatement } from "./importStatement";
import { moduleToMarkdown } from "./moduleToMarkdown";

/** Turns one module into the contents of its instruction file. */
export type LlmFormat = (module: ModuleInfo) => string;

/** Build context passed to `importFrom` / `fileName` — the project root (the module's own folder
 * is on `module.dir`). */
export interface ImportFromContext {
	/** The project root. */
	root: string;
}

export interface MarkdownFormatOptions {
	/**
	 * Where a module is imported from — prints one `import { A, B } from "…"` line with all of its
	 * bindings. A string (`"@acme/ui"`) or a function `(module, { root }) => string` (the module's
	 * folder is on `module.dir`). Omit to skip it.
	 */
	importFrom?:
		| string
		| ((module: ModuleInfo, ctx: ImportFromContext) => string);
	/** Which props to surface — a {@link PropFilter} map or predicate. Defaults to {@link DEFAULT_PROP_FILTER}. */
	filterProps?: PropFilter;
	/**
	 * Keep a component's **own** props (those it declares itself) regardless of `filterProps`.
	 * Default `true` — a component's own API always shows. Set `false` to filter own props too
	 * (e.g. an own `onClick` then falls under the hidden `event:mouse` group).
	 */
	keepOwnProps?: boolean;
	/** Project root — passed to an `importFrom` function as `dirs.root`. */
	root?: string;
}

/**
 * The built-in {@link LlmFormat}: renders a module as the Markdown card (`@module` prose, import
 * line, examples, then each component's description, `@remarks` usage, deprecation and props
 * table). Wrap it to extend the default output.
 */
export function markdownFormat(options: MarkdownFormatOptions = {}): LlmFormat {
	const {
		importFrom,
		filterProps = DEFAULT_PROP_FILTER,
		keepOwnProps = true,
		root = "",
	} = options;
	const keep = asPropFilterFn(filterProps);
	return (module) =>
		moduleToMarkdown(
			{
				...module,
				components: module.components.map((component) => ({
					...component,
					props: component.props.filter(
						(p) =>
							(keepOwnProps && p.inheritedFrom === undefined) ||
							keep(p, component),
					),
				})),
			},
			{ importStatement: importStatement(importFrom, module, root) },
		);
}
