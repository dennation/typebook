import { CodeBlock } from "@react/features/code-block/index";
import { type ReactNode, useState } from "react";

export interface SnippetProps {
	/**
	 * The example, as an inline function component — `{() => <…/>}`, or a named
	 * `{function Counter() { … }}` when it uses hooks. It is rendered live; its body
	 * is what the build step slices as the shown source. Must be an inline function
	 * literal (a bare reference or raw JSX can't be sliced and raises a build error).
	 */
	children: () => ReactNode;
	/** Optional label shown as the filename above the revealed source. */
	name?: string;
	/**
	 * @internal Sliced source of `children`'s body, injected by the bundler plugin at
	 * build time. Never written by hand; absent when the plugin didn't run.
	 */
	__snippetSource?: string;
}

/**
 * Renders the example component live, plus a toggle that reveals the original source
 * the build step sliced from `children`. The source arrives as the injected
 * `__snippetSource` prop (no context, no runtime fetch) and is rendered via `CodeBlock`.
 */
export function Snippet({
	children: Demo,
	name,
	__snippetSource: code,
}: SnippetProps) {
	const [open, setOpen] = useState(false);

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
							<CodeBlock code={code} lang="tsx" file={name} />
						) : (
							<p className="text-xs text-fg-muted p-3 m-0">
								No source found for this snippet. Add the typebook bundler
								plugin and rebuild.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
