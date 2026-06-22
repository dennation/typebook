import { CodeBlock } from "@react/features/code-block/index";
import { type ComponentType, type ReactNode, useState } from "react";

/**
 * What a `<Snippet source={…}>` layout render-prop receives: the live demo and its revealed source,
 * ready to place however you like. `source` is the source already rendered as a `<CodeBlock>` (or
 * `null` when the plugin didn't run); `code` is the same source as raw text, for rendering it
 * yourself.
 */
export interface SnippetRenderProps {
	/** The example, rendered live. */
	preview: ReactNode;
	/** The revealed source as a ready `<CodeBlock>`, or `null` when no source was injected. */
	source: ReactNode | null;
	/** The raw sliced source text, for rendering the code your own way. */
	code?: string;
	/** The optional `name` label. */
	name?: string;
}

export interface SnippetProps {
	/**
	 * The example. Two forms:
	 * - **inline** `{() => <…/>}` (or `{function Counter(){…}}` for hooks) — rendered live; the
	 *   build slices its body as the shown source.
	 * - **layout render-prop** `{({ preview, source }) => …}` — used together with `source` to lay
	 *   out the demo and its code yourself (where and how each appears).
	 */
	children?: (() => ReactNode) | ((slots: SnippetRenderProps) => ReactNode);
	/**
	 * A reference to the example component declared elsewhere — in this file or imported from
	 * another. The build resolves it (through the TypeScript program) and slices its body as the
	 * shown source, so the example can live anywhere and be written in any form. When given,
	 * `children` becomes a layout render-prop receiving `{ preview, source }`; omit `children` for
	 * the default card.
	 */
	source?: ComponentType;
	/** Optional label shown as the filename above the revealed source. */
	name?: string;
	/**
	 * @internal Sliced source injected by the bundler plugin at build time — from the inline child,
	 * or resolved from the `source` reference. Never written by hand; absent when the plugin didn't run.
	 */
	__snippetSource?: string;
}

/**
 * Renders the example component live, plus its source. The source arrives as the injected
 * `__snippetSource` prop (no context, no runtime fetch) and is rendered via `CodeBlock`.
 *
 * - Default: a card with a "show source" toggle.
 * - With a layout render-prop child (alongside `source`), you control where and how the preview
 *   and the source appear.
 */
export function Snippet({
	children,
	source: Source,
	name,
	__snippetSource: code,
}: SnippetProps) {
	const sourceNode: ReactNode | null =
		code !== undefined ? (
			<CodeBlock code={code} lang="tsx" file={name} />
		) : null;

	// `source={ref}` form: the demo is the referenced component; `children`, if any, is the layout.
	if (Source) {
		const preview = <Source />;
		if (children) {
			const layout = children as (slots: SnippetRenderProps) => ReactNode;
			return <>{layout({ preview, source: sourceNode, code, name })}</>;
		}
		return <SnippetCard preview={preview} source={sourceNode} />;
	}

	// Inline form: `children` is the example component, rendered live.
	const Demo = children as (() => ReactNode) | undefined;
	return <SnippetCard preview={Demo ? <Demo /> : null} source={sourceNode} />;
}

/** The default presentation: the live preview above a toggle that reveals the source. */
function SnippetCard({
	preview,
	source,
}: {
	preview: ReactNode;
	source: ReactNode | null;
}) {
	const [open, setOpen] = useState(false);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			<div className="p-4">{preview}</div>
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
						{source ?? (
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
