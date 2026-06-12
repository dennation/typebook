import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";

export interface PrevNextItem {
	title: string;
}

export interface PrevNextNavProps {
	prev?: PrevNextItem | null;
	next?: PrevNextItem | null;
	onPrev?: () => void;
	onNext?: () => void;
}

const CARD =
	"group border border-border rounded-[var(--radius-token)] px-4.25 py-3.75 transition-all duration-150 bg-bg hover:border-accent-soft-border hover:shadow-sm text-left w-full";
const LABEL = "text-[12px] text-fg-subtle mb-1.5 flex items-center gap-1.5";
const TITLE = "text-[15px] font-semibold text-fg group-hover:text-accent";

/** Previous/next page cards at the bottom of a docs page. */
export function PrevNextNav({ prev, next, onPrev, onNext }: PrevNextNavProps) {
	return (
		<nav className="grid grid-cols-2 gap-3.5 max-[820px]:grid-cols-1">
			{prev ? (
				<button type="button" className={CARD} onClick={onPrev}>
					<div className={LABEL}>
						<Icon.chevL size={13} /> Previous
					</div>
					<div className={TITLE}>{prev.title}</div>
				</button>
			) : (
				<span />
			)}
			{next ? (
				<button
					type="button"
					className={cx(CARD, "text-right")}
					onClick={onNext}
				>
					<div className={cx(LABEL, "justify-end")}>
						Next <Icon.chevR size={13} />
					</div>
					<div className={TITLE}>{next.title}</div>
				</button>
			) : (
				<span />
			)}
		</nav>
	);
}
