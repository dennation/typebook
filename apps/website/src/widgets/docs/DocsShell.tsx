import {
	Breadcrumbs,
	DocsSidebar,
	DocsToc,
	Icon,
	PrevNextNav,
	useDocHeadings,
} from "@dennation/typebook/react";
import { Outlet, useMatches } from "@tanstack/react-router";
import { useRef } from "react";
import { DEFAULT_DOCS_SLUG, NAV, pageMeta } from "../../entities/docs/nav";
import { GITHUB_URL } from "../../shared/lib/siteLinks";
import { useShell } from "../layout/ShellContext";
import { useDocsGo } from "./useDocsGo";

/** Current docs slug from the matched leaf route (`/docs/<slug>`). */
function useCurrentSlug(): string {
	const matches = useMatches();
	const leafId = matches[matches.length - 1]?.routeId ?? "";
	return leafId.split("/").pop() || DEFAULT_DOCS_SLUG;
}

/**
 * Docs layout shell: sidebar + content + TOC under the shared site header.
 * Rendered once by the `/docs` layout route; the per-page content comes
 * through `<Outlet />`, so the chrome (sidebar, breadcrumbs, TOC, prev/next)
 * never remounts when switching pages.
 */
export function DocsShell() {
	const { docsMenuOpen, setDocsMenuOpen } = useShell();
	const contentRef = useRef<HTMLElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);
	const go = useDocsGo();

	const slug = useCurrentSlug();
	const meta = pageMeta(slug);
	const { prev, next } = meta;

	const { headings, activeId, jump } = useDocHeadings({
		contentRef,
		scrollerRef,
		pageKey: slug,
	});

	return (
		<div className="min-h-screen">
			<div className="grid grid-cols-[270px_minmax(0,1fr)_252px] max-w-370 mx-auto max-[1100px]:grid-cols-[270px_minmax(0,1fr)] max-[820px]:grid-cols-[minmax(0,1fr)]">
				<DocsSidebar
					sections={NAV}
					current={slug}
					onNavigate={go}
					open={docsMenuOpen}
					onClose={() => setDocsMenuOpen(false)}
				/>

				<div
					className="h-[calc(100vh-56px)] overflow-y-auto min-w-0"
					ref={scrollerRef}
				>
					<div className="min-w-0 flex justify-center px-14 max-[1100px]:px-10 max-[820px]:px-5.5">
						<main
							className="w-full max-w-(--content-width) pt-10 pb-24 max-[820px]:pt-7"
							ref={contentRef}
							key={slug}
						>
							<Breadcrumbs
								items={["Docs", meta.page.section, meta.page.title]}
							/>
							<h1 className="text-[34px] font-[650] tracking-[-0.03em] leading-[1.12] m-0 mb-3.5">
								{meta.page.title}
							</h1>
							<div className="doc-prose text-[15.5px] leading-[calc(1.72*var(--density))] [&>*+*]:mt-[calc(18px*var(--density))]">
								<Outlet />
							</div>

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
								<PrevNextNav
									prev={prev}
									next={next}
									onPrev={() => prev && go(prev.slug)}
									onNext={() => next && go(next.slug)}
								/>
							</footer>
						</main>
					</div>
				</div>

				<DocsToc
					headings={headings}
					activeId={activeId}
					onJump={jump}
					editHref={GITHUB_URL}
					issueHref={`${GITHUB_URL}/issues`}
				/>
			</div>
		</div>
	);
}
