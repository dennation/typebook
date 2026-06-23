import { CodeBlock } from "./CodeBlock";

export interface SourceBlockProps {
	/** The source code to render. */
	code: string;
	/** Optional filename label shown above the code. */
	name?: string;
	/** Language for highlighting (default `"tsx"`). */
	lang?: string;
}

/**
 * A single-tab `<CodeBlock>` for a piece of revealed source. The shared way `<Snippet>` and
 * `<Story>` render their "show source" code, so neither hand-writes the Root/Tab boilerplate.
 */
export function SourceBlock({ code, name, lang = "tsx" }: SourceBlockProps) {
	return (
		<CodeBlock.Root>
			<CodeBlock.Tab lang={lang} file={name}>
				{code}
			</CodeBlock.Tab>
		</CodeBlock.Root>
	);
}
