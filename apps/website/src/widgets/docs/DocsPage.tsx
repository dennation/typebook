import { cx, Icon } from "@dennation/typebook/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { pageMeta } from "../../entities/docs/nav.js";
import { SearchPalette } from "../../features/docs-search/SearchPalette.js";
import { DocsHeader } from "./DocsHeader.js";
import { DocsSidebar } from "./DocsSidebar.js";
import { DocsToc } from "./DocsToc.js";
import type { DocsGo, DocsHeading } from "./go.js";
import { GenericPage, PAGES } from "./pages/index.js";

export interface DocsPageProps {
	slug: string;
	githubHref: string;
}

const PN_CARD =
	"group border border-border rounded-[var(--radius-token)] px-[17px] py-[15px] transition-all duration-[150ms] bg-bg hover:border-accent-soft-border hover:shadow-sm text-left w-full";
const PN_LABEL =
	"text-[12px] text-fg-subtle mb-[6px] flex items-center gap-[6px]";
const PN_TITLE = "text-[15px] font-semibold text-fg group-hover:text-accent";

/** Full docs screen: header + sidebar + content + TOC + ⌘K palette. */
export function DocsPage({ slug, githubHref }: DocsPageProps) {
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [headings, setHeadings] = useState<DocsHeading[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const contentRef = useRef<HTMLElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);

	const meta = pageMeta(slug);
	const { prev, next } = meta;
	const PageComp = PAGES[slug];

	const go = useCallback<DocsGo>(
		(next, heading) => {
			setMenuOpen(false);
			void navigate({
				to: "/docs/$slug",
				params: { slug: next },
				hash: heading,
			});
		},
		[navigate],
	);

	// keyboard: cmd/ctrl+K or '/' opens search, Escape closes
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen((v) => !v);
			} else if (e.key === "Escape") {
				setSearchOpen(false);
			} else if (
				e.key === "/" &&
				!/input|textarea/i.test((e.target as HTMLElement | null)?.tagName ?? "")
			) {
				e.preventDefault();
				setSearchOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// collect headings from the rendered DOM after page change,
	// then scroll to the hash target (or to the top)
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-collect when the page (slug) changes
	useEffect(() => {
		const t = setTimeout(() => {
			const root = contentRef.current;
			if (!root) return;
			const hs = [
				...root.querySelectorAll<HTMLElement>(".doc-h2, .doc-h3"),
			].map((el) => ({
				id: el.id,
				text: el.textContent?.trim() ?? "",
				level: (el.classList.contains("doc-h3") ? 3 : 2) as 2 | 3,
			}));
			setHeadings(hs);
			setActiveId(hs[0]?.id ?? null);

			const sc = scrollerRef.current;
			if (!sc) return;
			const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
			const target = hash ? document.getElementById(hash) : null;
			if (target)
				sc.scrollTo({ top: target.offsetTop - 16, behavior: "smooth" });
			else sc.scrollTo({ top: 0 });
		}, 30);
		return () => clearTimeout(t);
	}, [slug]);

	// scrollspy
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-bind when the page or its headings change
	useEffect(() => {
		const sc = scrollerRef.current;
		if (!sc) return;
		const onScroll = () => {
			const root = contentRef.current;
			if (!root) return;
			const els = [...root.querySelectorAll<HTMLElement>(".doc-h2, .doc-h3")];
			const top = sc.getBoundingClientRect().top + 96;
			let current = els[0]?.id ?? null;
			for (const el of els) {
				if (el.getBoundingClientRect().top <= top) current = el.id;
				else break;
			}
			setActiveId(current);
		};
		sc.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => sc.removeEventListener("scroll", onScroll);
	}, [slug, headings.length]);

	const jump = (id: string) => {
		const el = document.getElementById(id);
		const sc = scrollerRef.current;
		if (el && sc) sc.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen">
			<DocsHeader
				githubHref={githubHref}
				onOpenSearch={() => setSearchOpen(true)}
				onOpenMenu={() => setMenuOpen(true)}
			/>
			<div className="grid grid-cols-[270px_minmax(0,1fr)_252px] max-w-[1480px] mx-auto max-[1100px]:grid-cols-[270px_minmax(0,1fr)] max-[820px]:grid-cols-[minmax(0,1fr)]">
				<DocsSidebar
					current={slug}
					go={go}
					open={menuOpen}
					onClose={() => setMenuOpen(false)}
				/>

				<div
					className="h-[calc(100vh-56px)] overflow-y-auto min-w-0"
					ref={scrollerRef}
				>
					<div className="min-w-0 flex justify-center px-[56px] max-[1100px]:px-[40px] max-[820px]:px-[22px]">
						<main
							className="w-full max-w-[var(--content-width)] pt-[40px] pb-[96px] max-[820px]:pt-[28px]"
							ref={contentRef}
							key={slug}
						>
							<div className="flex items-center gap-[7px] text-[13px] text-fg-subtle mb-[18px]">
								<span>Docs</span>
								<span className="opacity-60 inline-flex">
									<Icon.chevR size={13} />
								</span>
								<span>{meta.page.section}</span>
								<span className="opacity-60 inline-flex">
									<Icon.chevR size={13} />
								</span>
								<span className="text-fg-muted">{meta.page.title}</span>
							</div>
							<h1 className="text-[34px] font-[650] tracking-[-0.03em] leading-[1.12] m-0 mb-[14px]">
								{meta.page.title}
							</h1>
							<div className="doc-prose text-[15.5px] leading-[calc(1.72*var(--density))] [&>*+*]:mt-[calc(18px*var(--density))]">
								{PageComp ? (
									<PageComp go={go} />
								) : (
									<GenericPage meta={meta} go={go} />
								)}
							</div>

							<footer className="mt-[calc(64px*var(--density))] pt-[28px] border-t border-border">
								<div className="flex items-center justify-between text-[13px] text-fg-subtle mb-[24px]">
									<a
										href={githubHref}
										className="text-fg-muted inline-flex items-center gap-[6px] hover:text-accent"
									>
										<Icon.edit size={14} /> Edit this page on GitHub
									</a>
									<span>Last updated May 28, 2026</span>
								</div>
								<nav className="grid grid-cols-2 gap-[14px] max-[820px]:grid-cols-1">
									{prev ? (
										<button
											type="button"
											className={PN_CARD}
											onClick={() => go(prev.slug)}
										>
											<div className={PN_LABEL}>
												<Icon.chevL size={13} /> Previous
											</div>
											<div className={PN_TITLE}>{prev.title}</div>
										</button>
									) : (
										<span />
									)}
									{next ? (
										<button
											type="button"
											className={cx(PN_CARD, "text-right")}
											onClick={() => go(next.slug)}
										>
											<div className={cx(PN_LABEL, "justify-end")}>
												Next <Icon.chevR size={13} />
											</div>
											<div className={PN_TITLE}>{next.title}</div>
										</button>
									) : (
										<span />
									)}
								</nav>
							</footer>
						</main>
					</div>
				</div>

				<DocsToc
					headings={headings}
					activeId={activeId}
					onJump={jump}
					editHref={githubHref}
					issueHref={`${githubHref}/issues`}
				/>
			</div>

			{searchOpen && (
				<SearchPalette onClose={() => setSearchOpen(false)} onNavigate={go} />
			)}
		</div>
	);
}
