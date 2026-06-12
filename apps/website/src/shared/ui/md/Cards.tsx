import { Icon } from "@dennation/typebook/react";
import type { ReactNode } from "react";

/** Two-column grid of linkable cards. */
export const Cards = ({ children }: { children: ReactNode }) => (
	<div className="grid grid-cols-2 gap-[12px] max-[820px]:grid-cols-1">
		{children}
	</div>
);

export interface DocCardProps {
	icon?: ReactNode;
	title: string;
	desc: string;
	onClick?: () => void;
}

/** Navigation card with icon, title and description. */
export function DocCard({ icon, title, desc, onClick }: DocCardProps) {
	return (
		<button
			type="button"
			className="block w-full text-left px-[18px] py-[17px] border border-border rounded-[var(--radius-token)] bg-bg-secondary transition-all duration-[150ms] hover:border-accent-soft-border hover:bg-bg hover:shadow-md hover:-translate-y-px"
			onClick={onClick}
		>
			{icon && (
				<span className="text-accent mb-[10px] inline-flex">{icon}</span>
			)}
			<div className="font-semibold text-[15px] mb-[3px] flex items-center gap-[6px]">
				{title} <Icon.chevR size={14} style={{ opacity: 0.5 }} />
			</div>
			<div className="text-[13.5px] text-fg-muted leading-[1.5]">{desc}</div>
		</button>
	);
}
