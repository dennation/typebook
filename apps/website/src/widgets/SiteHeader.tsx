import {
	ARROW_CLASS,
	buttonClass,
	cx,
	Icon,
	ThemeToggle,
} from "@dennation/typebook/react";
import { useEffect, useState } from "react";

export interface SiteHeaderProps {
	/** Link target for the "Docs" nav item and "Get started" button. */
	docsHref?: string;
	/** GitHub repository URL. */
	githubHref?: string;
	/** Version badge label. */
	version?: string;
}

const NAV_LINK =
	"text-[13.5px] text-fg-muted font-[450] px-[11px] py-[6px] rounded-[7px] transition-colors duration-[140ms] hover:text-fg hover:bg-bg-tertiary";
const ICON_BTN =
	"w-[34px] h-[34px] rounded-[var(--radius-token)] grid place-items-center bg-transparent border border-transparent text-fg-muted transition-colors duration-[140ms] hover:bg-bg-tertiary hover:text-fg hover:border-border";

/** Sticky marketing site header with nav, theme toggle and CTA. */
export function SiteHeader({
	docsHref = "#",
	githubHref = "#",
	version = "v2.4",
}: SiteHeaderProps) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cx(
				"sticky top-0 z-50 h-[56px] flex items-center gap-[16px] px-[22px] bg-[color-mix(in_oklch,var(--bg)_82%,transparent)] backdrop-saturate-[1.4] backdrop-blur-[12px] border-b transition-[border-color,background] duration-200",
				scrolled ? "border-border" : "border-transparent",
			)}
		>
			<a
				className="flex items-center gap-[10px] font-semibold tracking-[-0.02em] text-[15px]"
				href="#top"
			>
				<span className="w-[26px] h-[26px] rounded-[7px] bg-fg text-bg grid place-items-center font-mono font-semibold text-[14px] shrink-0">
					T
				</span>
				Typebok
				<span className="text-[11px] font-mono text-fg-muted border border-border rounded-[99px] px-[8px] py-[2px] ml-[2px]">
					{version}
				</span>
			</a>
			<nav className="flex gap-[2px] ml-[14px] max-[820px]:hidden">
				<a href="#features" className={NAV_LINK}>
					Features
				</a>
				<a href="#compare" className={NAV_LINK}>
					Compare
				</a>
				<a href={docsHref} className={NAV_LINK}>
					Docs
				</a>
				<a href="#top" className={NAV_LINK}>
					Showcase
				</a>
			</nav>
			<span className="flex-1" />
			<div className="flex items-center gap-[6px]">
				<a className={ICON_BTN} href={githubHref} aria-label="GitHub">
					<Icon.github size={18} />
				</a>
				<ThemeToggle className={ICON_BTN} />
				<a
					className={cx(buttonClass("primary", "sm"), "ml-[4px]")}
					href={docsHref}
				>
					Get started <Icon.chevR size={15} className={ARROW_CLASS} />
				</a>
			</div>
		</header>
	);
}
