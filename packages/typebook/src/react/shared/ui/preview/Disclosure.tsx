import { type ReactNode, useState } from "react";

export interface DisclosureProps {
	/** Lowercase noun shown in the button: "Show {label}" / "Hide {label}". */
	label: string;
	children: ReactNode;
}

/**
 * A bordered, collapsible footer row toggled by a "Show {label}" / "Hide {label}" button. Used for
 * the per-preview "source" and "controls" panels in `<PreviewCard>` / `<PreviewFrame>`.
 */
export function Disclosure({ label, children }: DisclosureProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="border-t border-border">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				className="w-full text-left text-xs px-3 py-2 font-medium text-fg-muted hover:text-fg bg-bg-secondary cursor-pointer transition-colors"
			>
				{open ? `Hide ${label}` : `Show ${label}`}
			</button>
			{open && <div className="p-2">{children}</div>}
		</div>
	);
}
