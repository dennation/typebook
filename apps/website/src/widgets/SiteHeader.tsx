import {
	ARROW_CLASS,
	buttonClass,
	cx,
	Icon,
	ThemeToggle,
} from "@dennation/typebook/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULT_DOCS_SLUG } from "../entities/docs/nav.js";
import { GITHUB_URL } from "../shared/lib/siteLinks.js";
import { useShell } from "./layout/ShellContext.js";

const NAV_LINK =
	"text-[13.5px] text-fg-muted font-[450] px-[11px] py-[6px] rounded-[7px] transition-colors duration-[140ms] hover:text-fg hover:bg-bg-tertiary";
const NAV_LINK_ACTIVE =
	"text-[13.5px] text-fg font-medium px-[11px] py-[6px] rounded-[7px] transition-colors duration-[140ms] hover:bg-bg-tertiary";
const ICON_BTN =
	"w-[34px] h-[34px] rounded-[var(--radius-token)] grid place-items-center bg-transparent border border-transparent text-fg-muted transition-colors duration-[140ms] hover:bg-bg-tertiary hover:text-fg hover:border-border";

export interface SiteHeaderProps {
	/** Version badge label. */
	version?: string;
}

/** The shared sticky site header: nav, ⌘K search, theme toggle and CTA. */
export function SiteHeader({ version = "v2.4" }: SiteHeaderProps) {
	const { openSearch, setDocsMenuOpen } = useShell();
	const isDocs = useRouterState({
		select: (s) => s.location.pathname.includes("/docs"),
	});
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Docs pages scroll an inner container, so the header keeps its border there.
	const bordered = scrolled || isDocs;

	return (
		<header
			className={cx(
				"sticky top-0 z-50 h-[56px] flex items-center gap-[16px] px-[22px] bg-[color-mix(in_oklch,var(--bg)_82%,transparent)] backdrop-saturate-[1.4] backdrop-blur-[12px] border-b transition-[border-color,background] duration-200",
				bordered ? "border-border" : "border-transparent",
			)}
		>
			{isDocs && (
				<button
					type="button"
					className={cx("hidden max-[820px]:grid", ICON_BTN)}
					onClick={() => setDocsMenuOpen(true)}
					aria-label="Open menu"
				>
					<Icon.menu size={18} />
				</button>
			)}
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
					params={{ slug: DEFAULT_DOCS_SLUG }}
					className={isDocs ? NAV_LINK_ACTIVE : NAV_LINK}
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
			<span className="flex-1" />
			<div className="flex items-center gap-[6px]">
				<button
					type="button"
					className="flex items-center gap-[9px] h-[34px] pl-[11px] pr-[8px] min-w-[210px] bg-bg-secondary border border-border rounded-[var(--radius-token)] text-fg-subtle text-[13px] transition-colors duration-[140ms] hover:border-border-strong hover:bg-bg-tertiary max-[820px]:min-w-0"
					onClick={openSearch}
				>
					<Icon.search size={15} />
					<span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis max-[820px]:hidden">
						Search documentation…
					</span>
					<kbd className="font-mono text-[11px] bg-bg border border-border rounded-[5px] px-[5px] py-[1px] text-fg-muted shadow-sm max-[820px]:hidden">
						⌘K
					</kbd>
				</button>
				<a
					className={ICON_BTN}
					href={GITHUB_URL}
					aria-label="GitHub"
					title="GitHub"
				>
					<Icon.github size={18} />
				</a>
				<ThemeToggle className={ICON_BTN} />
				<Link
					to="/docs/$slug"
					params={{ slug: DEFAULT_DOCS_SLUG }}
					className={cx(buttonClass("primary", "sm"), "ml-[4px]")}
				>
					Get started <Icon.chevR size={15} className={ARROW_CLASS} />
				</Link>
			</div>
		</header>
	);
}
