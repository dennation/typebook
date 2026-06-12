import { type RefObject, useEffect, useState } from "react";

export interface DocsHeading {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface UseDocHeadingsOptions {
	/** Container whose rendered `.doc-h2`/`.doc-h3` headings are collected. */
	contentRef: RefObject<HTMLElement | null>;
	/** Scrollable ancestor used for scrollspy and jumps. */
	scrollerRef: RefObject<HTMLElement | null>;
	/** Re-collect when this key changes (e.g. the page slug). */
	pageKey: string;
}

/**
 * Collects headings from the rendered page, tracks the active one while the
 * scroller scrolls (scrollspy), and scrolls to the URL hash target (or to the
 * top) after each page change. Returns a `jump(id)` helper for the TOC.
 */
export function useDocHeadings({
	contentRef,
	scrollerRef,
	pageKey,
}: UseDocHeadingsOptions) {
	const [headings, setHeadings] = useState<DocsHeading[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	// collect headings from the rendered DOM after page change,
	// then scroll to the hash target (or to the top)
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-collect when the page changes
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
	}, [pageKey]);

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
	}, [pageKey, headings.length]);

	const jump = (id: string) => {
		const el = document.getElementById(id);
		const sc = scrollerRef.current;
		if (el && sc) sc.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
	};

	return { headings, activeId, jump };
}
