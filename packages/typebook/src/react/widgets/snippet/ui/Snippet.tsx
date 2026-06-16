import { useSnippet } from "@react/entities/snippets/index.js";
import { CodeBlock } from "@react/features/code-block/index.js";
import { type ReactNode, useState } from "react";

export interface SnippetProps {
	/**
	 * Author-chosen identifier for this block. At build time the plugin extracts
	 * the example's source into the generated `snippets.gen.ts` under this key;
	 * at runtime the component reads it back from context. Must be unique across
	 * the project. (Not `key` — reserved by React; not `codeId` — by request.)
	 */
	name: string;
	/**
	 * The example, as a component function — either inline (`{() => <…/>}`, or a
	 * named `{function Counter() { … }}` when it uses hooks) or a reference to a
	 * component declared elsewhere (`{Counter}`). It is rendered live; its body is
	 * what the build step extracts as the shown source. Function components only —
	 * class components aren't supported.
	 */
	children: () => ReactNode;
}

/**
 * Renders the example component live, plus a toggle that reveals the original
 * source the build step extracted for `name`. The source is read synchronously
 * from the `TypebookProvider` context — no runtime fetch — and rendered via
 * `CodeBlock`.
 */
export function Snippet({ name, children: Demo }: SnippetProps) {
	const [open, setOpen] = useState(false);
	const code = useSnippet(name);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			<div className="p-4">
				<Demo />
			</div>
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
					<div className="p-2">
						{code !== undefined ? (
							<CodeBlock code={code} lang="tsx" />
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
