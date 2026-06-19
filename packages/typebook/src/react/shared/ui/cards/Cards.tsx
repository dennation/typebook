import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Two-column grid of linkable cards. */
export const Cards = ({ children }: { children: ReactNode }) => (
	<div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
		{children}
	</div>
);

export interface DocCardProps {
	/** Accent-colored icon above the title. */
	icon?: ReactNode;
	/** Card heading; a chevron is appended automatically. */
	title: string;
	/** One-line description under the title. */
	desc: string;
	/** Trailing chevron next to the title. @default <ChevronRight size={14} style={{ opacity: 0.5 }} /> */
	chevron?: ReactNode;
	/** Navigation handler. Cards render as buttons, so routing stays yours. */
	onClick?: () => void;
}

/** Navigation card with icon, title and description. */
export function DocCard({
	icon,
	title,
	desc,
	chevron = <ChevronRight size={14} style={{ opacity: 0.5 }} />,
	onClick,
}: DocCardProps) {
	return (
		<button
			type="button"
			className="block w-full text-left px-4.5 py-4.25 border border-border rounded-(--radius-token) bg-bg-secondary transition-all duration-150 hover:border-accent-soft-border hover:bg-bg hover:shadow-md hover:-translate-y-px"
			onClick={onClick}
		>
			{icon && <span className="text-accent mb-2.5 inline-flex">{icon}</span>}
			<div className="font-semibold text-[15px] mb-0.75 flex items-center gap-1.5">
				{title} {chevron}
			</div>
			<div className="text-[13.5px] text-fg-muted leading-[1.5]">{desc}</div>
		</button>
	);
}
