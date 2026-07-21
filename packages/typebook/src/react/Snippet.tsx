import {
	type ComponentType,
	type CSSProperties,
	type ReactNode,
	useState,
} from "react";

/**
 * What a `<Snippet source={…}>` layout render-prop receives: the live demo and its revealed source,
 * ready to place however you like. `source` is the source already rendered as a code block (or
 * `null` when the plugin didn't run); `code` is the same source as raw text, for rendering it
 * yourself.
 */
export interface SnippetRenderProps {
	/** The example, rendered live. */
	preview: ReactNode;
	/** The revealed source as a ready code block, or `null` when no source was injected. */
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
 * `__snippetSource` prop (no context, no runtime fetch) and is rendered in a plain code block.
 *
 * This runtime is intentionally dependency-free (React only) — no syntax highlighting or design
 * system — so `<Snippet>` works on the release-scoped package without pulling in the full docs kit.
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
		code !== undefined ? <SourceBlock code={code} name={name} /> : null;

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

const cardStyle: CSSProperties = {
	border: "1px solid rgba(128, 128, 128, 0.3)",
	borderRadius: 8,
	overflow: "hidden",
};

const previewStyle: CSSProperties = { padding: 16 };

const toggleStyle: CSSProperties = {
	display: "block",
	width: "100%",
	padding: "6px 12px",
	font: "inherit",
	fontSize: 13,
	textAlign: "left",
	cursor: "pointer",
	border: "none",
	borderTop: "1px solid rgba(128, 128, 128, 0.3)",
	background: "rgba(128, 128, 128, 0.08)",
	color: "inherit",
};

const preStyle: CSSProperties = {
	margin: 0,
	padding: 16,
	overflowX: "auto",
	fontSize: 13,
	lineHeight: 1.5,
	borderTop: "1px solid rgba(128, 128, 128, 0.3)",
	background: "rgba(128, 128, 128, 0.06)",
};

const fileNameStyle: CSSProperties = {
	padding: "6px 16px",
	fontSize: 12,
	opacity: 0.7,
	borderTop: "1px solid rgba(128, 128, 128, 0.3)",
};

/** The revealed source: an optional filename label above a plain, scrollable `<pre>`. */
function SourceBlock({ code, name }: { code: string; name?: string }) {
	return (
		<>
			{name ? <div style={fileNameStyle}>{name}</div> : null}
			<pre style={preStyle}>
				<code>{code}</code>
			</pre>
		</>
	);
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
		<div style={cardStyle}>
			<div style={previewStyle}>{preview}</div>
			{source ? (
				<>
					<button
						type="button"
						style={toggleStyle}
						onClick={() => setOpen((v) => !v)}
						aria-expanded={open}
					>
						{open ? "Hide source" : "Show source"}
					</button>
					{open ? source : null}
				</>
			) : null}
		</div>
	);
}
