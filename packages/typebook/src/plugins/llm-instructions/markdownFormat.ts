import type { ComponentInfo } from "../../types";
import { componentToMarkdown } from "./componentToMarkdown";
import { DEFAULT_PROP_FILTER, type PropFilter } from "./filterProps";

/** Turns one scanned component into the contents of its instruction file. */
export type LlmFormat = (component: ComponentInfo) => string;

export interface MarkdownFormatOptions {
	/**
	 * Module each component is imported from — prints an `import { X } from "…"` line.
	 * A string (`"@acme/ui"`) or a function per component. Omit to skip the import line.
	 */
	importFrom?: string | ((component: ComponentInfo) => string);
	/** Which props to surface. Defaults to {@link DEFAULT_PROP_FILTER}. */
	filterProps?: PropFilter;
}

/**
 * The built-in {@link LlmFormat}: renders a component as the Markdown card (import line,
 * description, `@remarks` usage, deprecation, props table). Wrap it to extend the default output.
 */
export function markdownFormat(options: MarkdownFormatOptions = {}): LlmFormat {
	const { importFrom, filterProps = DEFAULT_PROP_FILTER } = options;
	return (component) =>
		componentToMarkdown(
			{
				...component,
				props: component.props.filter((p) => filterProps(p, component)),
			},
			{ importStatement: importStatement(importFrom, component) },
		);
}

function importStatement(
	importFrom: MarkdownFormatOptions["importFrom"],
	component: ComponentInfo,
): string | undefined {
	const src =
		typeof importFrom === "function" ? importFrom(component) : importFrom;
	return src ? `import { ${component.name} } from "${src}";` : undefined;
}
