import { cx, Icon, ThemeToggle } from "@dennation/typebook/react";
import { Link } from "@tanstack/react-router";

export interface DocsHeaderProps {
	githubHref: string;
	onOpenSearch: () => void;
	onOpenMenu: () => void;
	version?: string;
}

const NAV_LINK =
	"text-[13.5px] text-fg-muted font-[450] px-[11px] py-[6px] rounded-[7px] transition-colors duration-[140ms] hover:text-fg hover:bg-bg-tertiary";
const NAV_LINK_ACTIVE =
	"text-[13.5px] text-fg font-medium px-[11px] py-[6px] rounded-[7px] transition-colors duration-[140ms] hover:bg-bg-tertiary";
const ICON_BTN =
	"w-[34px] h-[34px] rounded-[var(--radius-token)] place-items-center bg-transparent border border-transparent text-fg-muted transition-colors duration-[140ms] hover:bg-bg-tertiary hover:text-fg hover:border-border";

/** Sticky docs header: logo, nav, search trigger, theme toggle, GitHub. */
export function DocsHeader({
	githubHref,
	onOpenSearch,
	onOpenMenu,
	version = "v2.4",
}: DocsHeaderProps) {
	return (
		<header className="sticky top-0 z-50 h-[56px] flex items-center gap-[16px] px-[22px] bg-[color-mix(in_oklch,var(--bg)_82%,transparent)] backdrop-saturate-[1.4] backdrop-blur-[12px] border-b border-border">
			<button
				type="button"
				className={cx("hidden max-[820px]:grid", ICON_BTN)}
				onClick={onOpenMenu}
				aria-label="Open menu"
			>
				<Icon.menu size={18} />
			</button>
			<Link
				to="/"
				className="flex items-center gap-[10px] font-semibold tracking-[-0.02em] text-[15px]"
			>
				<span className="w-[26px] h-[26px] rounded-[7px] bg-fg text-bg grid place-items-center font-mono font-semibold text-[14px] shrink-0">
					T
				</span>
				Typebok
				<span className="text-[11px] font-mono text-fg-muted border border-border rounded-[99px] px-[8px] py-[2px] ml-[2px]">
					{version}
				</span>
			</Link>
			<nav className="flex gap-[2px] ml-[14px] max-[820px]:hidden">
				<Link
					to="/docs/$slug"
					params={{ slug: "introduction" }}
					className={NAV_LINK_ACTIVE}
				>
					Docs
				</Link>
				<a href={`${import.meta.env.BASE_URL}#features`} className={NAV_LINK}>
					Features
				</a>
				<a href={`${import.meta.env.BASE_URL}#compare`} className={NAV_LINK}>
					Compare
				</a>
			</nav>
			<div className="flex-1" />
			<button
				type="button"
				className="flex items-center gap-[9px] h-[34px] pl-[11px] pr-[8px] min-w-[210px] bg-bg-secondary border border-border rounded-[var(--radius-token)] text-fg-subtle text-[13px] transition-colors duration-[140ms] hover:border-border-strong hover:bg-bg-tertiary max-[820px]:min-w-0"
				onClick={onOpenSearch}
			>
				<Icon.search size={15} />
				<span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis max-[820px]:hidden">
					Search documentation…
				</span>
				<kbd className="font-mono text-[11px] bg-bg border border-border rounded-[5px] px-[5px] py-[1px] text-fg-muted shadow-sm max-[820px]:hidden">
					⌘K
				</kbd>
			</button>
			<ThemeToggle className={cx("grid", ICON_BTN)} />
			<a
				className={cx("grid", ICON_BTN)}
				href={githubHref}
				aria-label="GitHub"
				title="GitHub"
			>
				<Icon.github size={17} />
			</a>
		</header>
	);
}
