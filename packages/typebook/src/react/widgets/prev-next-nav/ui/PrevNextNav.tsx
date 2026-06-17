import { Icon } from "@react/shared/ui/icon/index.js";
import { tv } from "tailwind-variants";

export interface PrevNextItem {
	title: string;
}

export interface PrevNextNavProps {
	/** Previous-page card contents; a missing side renders an empty slot to keep the grid. */
	prev?: PrevNextItem | null;
	/** Next-page card contents; a missing side renders an empty slot to keep the grid. */
	next?: PrevNextItem | null;
	/** Click handler for the previous-page card. */
	onPrev?: () => void;
	/** Click handler for the next-page card. */
	onNext?: () => void;
}

const prevNextNav = tv({
	slots: {
		card: "group border border-border rounded-(--radius-token) px-4.25 py-3.75 transition-all duration-150 bg-bg hover:border-accent-soft-border hover:shadow-sm text-left w-full",
		label: "text-[12px] text-fg-subtle mb-1.5 flex items-center gap-1.5",
		title: "text-[15px] font-semibold text-fg group-hover:text-accent",
	},
	variants: {
		next: {
			true: { card: "text-right", label: "justify-end" },
		},
	},
});

/** Previous/next page cards at the bottom of a docs page. */
export function PrevNextNav({ prev, next, onPrev, onNext }: PrevNextNavProps) {
	const prevCls = prevNextNav();
	const nextCls = prevNextNav({ next: true });
	return (
		<nav className="grid grid-cols-2 gap-3.5 max-[820px]:grid-cols-1">
			{prev ? (
				<button type="button" className={prevCls.card()} onClick={onPrev}>
					<div className={prevCls.label()}>
						<Icon.chevL size={13} /> Previous
					</div>
					<div className={prevCls.title()}>{prev.title}</div>
				</button>
			) : (
				<span />
			)}
			{next ? (
				<button type="button" className={nextCls.card()} onClick={onNext}>
					<div className={nextCls.label()}>
						Next <Icon.chevR size={13} />
					</div>
					<div className={nextCls.title()}>{next.title}</div>
				</button>
			) : (
				<span />
			)}
		</nav>
	);
}
