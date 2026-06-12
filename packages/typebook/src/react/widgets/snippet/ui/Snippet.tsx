import { useSnippet } from "@react/entities/snippets/index.js";
import {
	type CodeTheme,
	SourceCode,
} from "@react/features/source-code/index.js";
import { type ReactNode, useState } from "react";

export interface SnippetProps {
	/**
	 * Author-chosen identifier for this block. At build time the plugin extracts
	 * the children's source into the generated `snippets.gen.ts` under this key;
	 * at runtime the component reads it back from context. Must be unique across
	 * the project. (Not `key` — reserved by React; not `codeId` — by request.)
	 */
	name: string;
	/** Live content rendered above the "show source" toggle. */
	children: ReactNode;
	/** Shiki light/dark theme override forwarded to the underlying SourceCode. */
	theme?: CodeTheme;
}

/**
 * Renders its children live, plus a toggle that reveals the original source the
 * build step extracted for `name`. The source is read synchronously from the
 * `TypebookProvider` context — no runtime fetch.
 */
export function Snippet({ name, children, theme }: SnippetProps) {
	const [open, setOpen] = useState(false);
	const code = useSnippet(name);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			<div className="p-4">{children}</div>
			<div className="border-t border-border">
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					className="w-full text-left text-xs px-3 py-2 font-medium text-fg-muted hover:text-fg bg-bg-secondary cursor-pointer transition-colors"
				>
					{open ? "Hide source" : "Show source"}
				</button>
				{open && (
					<div className="border-t border-border">
						{code !== undefined ? (
							<SourceCode code={code} theme={theme} />
						) : (
							<p className="text-xs text-fg-muted p-3 m-0">
								No source found for snippet "{name}". Pass <code>snippets</code>{" "}
								to <code>TypebookProvider</code> and run the build.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
