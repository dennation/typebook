import {
	Breadcrumbs,
	DocsSidebar,
	DocsToc,
	Icon,
	PrevNextNav,
	useDocHeadings,
} from "@dennation/typebook/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { NAV, pageMeta } from "../../entities/docs/nav.js";
import { useShell } from "../layout/ShellContext.js";
import type { DocsGo } from "./go.js";
import { GenericPage, PAGES } from "./pages/index.js";

export interface DocsPageProps {
	slug: string;
	githubHref: string;
}

/** Full docs screen: sidebar + content + TOC under the shared site header. */
export function DocsPage({ slug, githubHref }: DocsPageProps) {
	const navigate = useNavigate();
	const { docsMenuOpen, setDocsMenuOpen } = useShell();
	const contentRef = useRef<HTMLElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);

	const meta = pageMeta(slug);
	const { prev, next } = meta;
	const PageComp = PAGES[slug];

	const { headings, activeId, jump } = useDocHeadings({
		contentRef,
		scrollerRef,
		pageKey: slug,
	});

	const go = useCallback<DocsGo>(
		(nextSlug, heading) => {
			setDocsMenuOpen(false);
			void navigate({
				to: "/docs/$slug",
				params: { slug: nextSlug },
				hash: heading,
			});
		},
		[navigate, setDocsMenuOpen],
	);

	return (
		<div className="min-h-screen">
			<div className="grid grid-cols-[270px_minmax(0,1fr)_252px] max-w-[1480px] mx-auto max-[1100px]:grid-cols-[270px_minmax(0,1fr)] max-[820px]:grid-cols-[minmax(0,1fr)]">
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
					<div className="min-w-0 flex justify-center px-[56px] max-[1100px]:px-[40px] max-[820px]:px-[22px]">
						<main
							className="w-full max-w-[var(--content-width)] pt-[40px] pb-[96px] max-[820px]:pt-[28px]"
							ref={contentRef}
							key={slug}
						>
							<Breadcrumbs
								items={["Docs", meta.page.section, meta.page.title]}
							/>
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
					editHref={githubHref}
					issueHref={`${githubHref}/issues`}
				/>
			</div>
		</div>
	);
}
