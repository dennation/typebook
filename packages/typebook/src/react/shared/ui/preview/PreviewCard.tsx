import type { ReactNode } from "react";
import { Disclosure } from "./Disclosure";
import { SourceToggle } from "./SourceToggle";

export interface PreviewCardProps {
	/** The live preview, rendered as-is (the caller owns its padding/centering). */
	preview: ReactNode;
	/**
	 * The revealed source. Pass a node (or `null`) to show the "show source" toggle; omit it
	 * (leave `undefined`) for a card with no source row. `null` shows the "no source" fallback.
	 */
	source?: ReactNode | null;
	/** An interactive controls panel; pass a node to show the "show controls" toggle. */
	controls?: ReactNode;
	/** Optional caption shown as a header above the preview. */
	label?: string;
}

/**
 * The shared preview card: a bordered block with an optional header label, the live preview, and
 * optional "show source" / "show controls" toggles. Used by `<Story>` and `<Snippet>`.
 */
export function PreviewCard({
	preview,
	source,
	controls,
	label,
}: PreviewCardProps) {
	return (
		<div className="border border-border rounded-lg overflow-hidden">
			{label && (
				<div className="text-xs px-3 py-2 font-medium text-fg-muted border-b border-border bg-bg-secondary">
					{label}
				</div>
			)}
			{preview}
			{source !== undefined && <SourceToggle source={source} />}
			{controls !== undefined && (
				<Disclosure label="controls">{controls}</Disclosure>
			)}
		</div>
	);
}
