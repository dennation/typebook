import type { ReactNode } from "react";

export interface CodeBlockTabProps {
	/** Tab label shown in the tab bar. @default the `file`, else the `lang` */
	label?: string;
	/**
	 * Any Shiki language id (tsx, css, yaml, python, …). Grammars load on demand;
	 * unknown ids fall back to plain text.
	 * @default "tsx"
	 */
	lang?: string;
	/** Filename shown for this tab; also the default tab label. */
	file?: string;
	/** Small icon rendered next to the label. */
	icon?: ReactNode;
	/** Render a line-number gutter. */
	showLineNumbers?: boolean;
	/**
	 * 1-based line numbers to tint with the accent color.
	 * @default []
	 */
	highlightLines?: number[];
	/** The tab's code, passed as a string child (use a template literal). */
	children: string;
}

/**
 * One code variant inside `<CodeBlock.Root>`. Never renders on its own —
 * `<CodeBlock.Root>` reads its props (and string child) to build the tab.
 */
export function CodeBlockTab(_props: CodeBlockTabProps): null {
	return null;
}
CodeBlockTab.displayName = "CodeBlock.Tab";
