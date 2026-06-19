import { cx, Icon } from "@dennation/typebook/react";
import { Link } from "@tanstack/react-router";
import { GITHUB_URL } from "../../shared/lib/siteLinks";

/** A prev/next target: a concrete docs route and its title. */
export interface DocsFooterLink {
	to: string;
	title: string;
}

export interface DocsFooterProps {
	prev?: DocsFooterLink;
	next?: DocsFooterLink;
}

const card =
	"group block no-underline border border-border rounded-(--radius-token) px-4.25 py-3.75 transition-all duration-150 bg-bg hover:border-accent-soft-border hover:shadow-sm";
const label = "text-[12px] text-fg-subtle mb-1.5 flex items-center gap-1.5";
const title = "text-[15px] font-semibold text-fg group-hover:text-accent";

/**
 * The footer at the bottom of a docs page: the "edit on GitHub" line and the
 * previous/next page cards. Each card is a real router `<Link>` to a concrete
 * page — prev/next are authored explicitly on each page, not derived.
 */
export function DocsFooter({ prev, next }: DocsFooterProps) {
	return (
		<footer className="mt-[calc(64px*var(--density))] pt-7 border-t border-border">
			<div className="flex items-center justify-between text-[13px] text-fg-subtle mb-6">
				<a
					href={GITHUB_URL}
					className="text-fg-muted inline-flex items-center gap-1.5 hover:text-accent"
				>
					<Icon.edit size={14} /> Edit this page on GitHub
				</a>
				<span>Last updated May 28, 2026</span>
			</div>
			<nav className="grid grid-cols-2 gap-3.5 max-[820px]:grid-cols-1">
				{prev ? (
					<Link to={prev.to as "/docs"} className={card}>
						<div className={label}>
							<Icon.chevL size={13} /> Previous
						</div>
						<div className={title}>{prev.title}</div>
					</Link>
				) : (
					<span />
				)}
				{next ? (
					<Link to={next.to as "/docs"} className={cx(card, "text-right")}>
						<div className={cx(label, "justify-end")}>
							Next <Icon.chevR size={13} />
						</div>
						<div className={title}>{next.title}</div>
					</Link>
				) : (
					<span />
				)}
			</nav>
		</footer>
	);
}
