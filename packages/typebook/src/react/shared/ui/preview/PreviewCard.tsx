import type { ReactNode } from "react";
import { SourceToggle } from "./SourceToggle";

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
	return (
		<div className="border border-border rounded-lg overflow-hidden">
			{label && (
				<div className="text-xs px-3 py-2 font-medium text-fg-muted border-b border-border bg-bg-secondary">
					{label}
				</div>
			)}
			{preview}
			{source !== undefined && <SourceToggle source={source} />}
		</div>
	);
}
