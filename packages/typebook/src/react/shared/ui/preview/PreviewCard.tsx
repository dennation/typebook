import { type ReactNode, useState } from "react";

export interface PreviewCardProps {
	/** The live preview, rendered as-is (the caller owns its padding/centering). */
	preview: ReactNode;
	/**
	 * The revealed source. Pass a node (or `null`) to show the "show source" toggle; omit it
	 * (leave `undefined`) for a card with no source row. `null` shows the "no source" fallback.
	 */
	source?: ReactNode | null;
	/** Optional caption shown as a header above the preview. */
	label?: string;
}

/**
 * The shared preview card: a bordered block with an optional header label, the live preview, and
 * an optional "show source" toggle revealing a code block. Used by `<Story>` and `<Snippet>`.
 */
export function PreviewCard({ preview, source, label }: PreviewCardProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="border border-border rounded-lg overflow-hidden">
			{label && (
				<div className="text-xs px-3 py-2 font-medium text-fg-muted border-b border-border bg-bg-secondary">
					{label}
				</div>
			)}
			{preview}
			{source !== undefined && (
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
			)}
		</div>
	);
}
