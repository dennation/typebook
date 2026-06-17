import {
	A,
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
} from "@dennation/typebook/react";
import type { DocsGo } from "../go.js";

export function PageHooks({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Two hooks ship with the package: <C>useDocHeadings</C> powers the table
				of contents, and <C>useSearchHotkeys</C> binds the palette shortcuts.
				(Component metadata is no longer looked up at runtime — it's injected
				into each <C>registerComponent()</C> call at build time, so the handle
				carries it directly.)
			</Lead>

			<H2>useDocHeadings</H2>
			<P>
				Collects <C>.doc-h2</C>/<C>.doc-h3</C> headings from the rendered page,
				tracks the active one while an inner container scrolls (scrollspy),
				scrolls to the URL hash target after page changes, and returns a{" "}
				<C>jump(id)</C> helper.
			</P>
			<CodeBlock
				file="DocsPage.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`const contentRef = useRef<HTMLElement>(null);
const scrollerRef = useRef<HTMLDivElement>(null);

const { headings, activeId, jump } = useDocHeadings({
  contentRef,    // container with the rendered headings
  scrollerRef,   // scrollable ancestor
  pageKey: slug, // re-collect when this changes
});`}
			/>
			<PropsReference
				props={[
					{
						name: "contentRef",
						type: "RefObject<HTMLElement>",
						required: true,
						desc: "Container whose rendered headings are collected.",
					},
					{
						name: "scrollerRef",
						type: "RefObject<HTMLElement>",
						required: true,
						desc: "Scrollable ancestor used for scrollspy and jumps.",
					},
					{
						name: "pageKey",
						type: "string",
						required: true,
						desc: "Re-collect when this key changes (e.g. the page slug).",
					},
				]}
			/>

			<H2>useSearchHotkeys</H2>
			<P>
				Global keyboard shortcuts for the search palette: ⌘K / Ctrl+K toggles,{" "}
				<C>/</C> opens (outside of inputs), Escape closes. See{" "}
				<A onClick={() => go("search")}>Search</A> for the full wiring.
			</P>
			<CodeBlock
				lang="tsx"
				code={`useSearchHotkeys({
  toggle: () => setOpen((v) => !v),
  open: () => setOpen(true),
  close: () => setOpen(false),
});`}
			/>
		</>
	);
}
