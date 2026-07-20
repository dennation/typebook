import type { ComponentInfo } from "../../types";
import { componentToMarkdown } from "./componentToMarkdown";
import {
	asPropFilterFn,
	DEFAULT_PROP_FILTER,
	type PropFilter,
} from "./filterProps";

/** Turns one scanned component into the contents of its instruction file. */
export type LlmFormat = (component: ComponentInfo) => string;

/** Build context passed to `entryPath` and `importFrom` — the project root (the component's own
 * folder is on `component.dir`). */
export interface EntryPathContext {
	/** The project root. */
	root: string;
}

export interface MarkdownFormatOptions {
	/**
	 * Module each component is imported from — prints an `import { X } from "…"` line. A string
	 * (`"@acme/ui"`) or a function `(component, { root }) => string` (the component's folder is on
	 * `component.dir`). Omit to skip it.
	 */
	importFrom?:
		| string
		| ((component: ComponentInfo, ctx: EntryPathContext) => string);
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
 * The built-in {@link LlmFormat}: renders a component as the Markdown card (import line,
 * description, `@remarks` usage, deprecation, props table). Wrap it to extend the default output.
 */
export function markdownFormat(options: MarkdownFormatOptions = {}): LlmFormat {
	const {
		importFrom,
		filterProps = DEFAULT_PROP_FILTER,
		keepOwnProps = true,
		root = "",
	} = options;
	const keep = asPropFilterFn(filterProps);
	return (component) =>
		componentToMarkdown(
			{
				...component,
				props: component.props.filter(
					(p) =>
						(keepOwnProps && p.inheritedFrom === undefined) ||
						keep(p, component),
				),
			},
			{ importStatement: importStatement(importFrom, component, root) },
		);
}

function importStatement(
	importFrom: MarkdownFormatOptions["importFrom"],
	component: ComponentInfo,
	root: string,
): string | undefined {
	const src =
		typeof importFrom === "function"
			? importFrom(component, { root })
			: importFrom;
	return src ? `import { ${component.name} } from "${src}";` : undefined;
}
