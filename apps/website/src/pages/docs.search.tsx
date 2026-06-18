import {
	C,
	Callout,
	CodeBlock,
	getComponentMeta,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
	propsToRows,
	SearchPalette,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";

const searchPalette = getComponentMeta(SearchPalette);

function PageSearch() {
	return (
		<>
			<Lead>
				<C>SearchPalette</C> is the ⌘K command palette: scored fuzzy filtering
				over a static index, section grouping, keyboard navigation and match
				highlighting. Press <C>⌘K</C> or <C>/</C> right now — the palette on
				this site is this component.
			</Lead>

			<H2>Usage</H2>
			<P>
				The palette is controlled: you own the open state and the index, it
				calls back with the chosen entry. <C>useSearchHotkeys</C> wires the
				standard shortcuts.
			</P>
			<CodeBlock
				file="src/RootLayout.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				showLineNumbers
				code={`import { SearchPalette, useSearchHotkeys } from "@dennation/typebook/react";

const [open, setOpen] = useState(false);
useSearchHotkeys({
  toggle: () => setOpen((v) => !v),
  open: () => setOpen(true),
  close: () => setOpen(false),
});

{open && (
  <SearchPalette
    index={SEARCH_INDEX}
    onClose={() => setOpen(false)}
    onNavigate={(slug, heading) => goToDocsPage(slug, heading)}
  />
)}`}
			/>

			<H2>The index</H2>
			<P>
				<C>SearchEntry</C> describes a page or a heading inside a page. Entries
				with a <C>heading</C> show a <C>#</C> icon and navigate to that anchor.
			</P>
			<CodeBlock
				file="search-index.ts"
				icon={<Icon.ts size={14} />}
				lang="tsx"
				code={`import type { SearchEntry } from "@dennation/typebook/react";

const SEARCH_INDEX: SearchEntry[] = [
  { slug: "callout", title: "Callout", section: "Components", desc: "Notes and warnings" },
  { slug: "callout", title: "Callout props", section: "Callout", heading: "props", desc: "" },
];`}
			/>

			<Callout type="info" title="Scoring">
				Title prefix match +10, title substring +5, anywhere in
				title+section+desc +2. Entries scoring 0 are dropped; an empty query
				shows the whole index.
			</Callout>

			<H2>SearchPalette props</H2>
			<PropsReference props={propsToRows(searchPalette.props)} />
			<DocsFooter
				prev={{ to: "/docs/prose", title: "Prose" }}
				next={{ to: "/docs/navigation", title: "Navigation" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/search")({ component: PageSearch });
