import { type ReactNode, useState } from "react";

export interface SourceToggleProps {
	/** The revealed source. `null` shows the "no source" fallback. */
	source: ReactNode | null;
}

/**
 * The shared "show source" control: a bordered toggle button that reveals a collapsible source
 * block. Used by `<PreviewCard>` (Story/Snippet card) and `<PreviewFrame>` (Variants/Matrix cell).
 */
export function SourceToggle({ source }: SourceToggleProps) {
	const [open, setOpen] = useState(false);

	return (
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
							No source found for this snippet. Add the typebook bundler plugin
							and rebuild.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
