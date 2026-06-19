import {
	Breadcrumbs,
	C,
	Callout,
	CodeBlock,
	getComponentMeta,
	H2,
	Icon,
	Lead,
	P,
	PrevNextNav,
	PropsReference,
	propsToRows,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";

const breadcrumbs = getComponentMeta(Breadcrumbs);
const prevNextNav = getComponentMeta(PrevNextNav);

function PageNavigation() {
	return (
		<>
			<Lead>
				The four pieces of docs chrome around the content: <C>DocsSidebar</C> on
				the left, <C>DocsToc</C> on the right, <C>Breadcrumbs</C> above the
				title and <C>PrevNextNav</C> at the bottom. All router-agnostic —
				navigation goes through callbacks. You are looking at all four right
				now.
			</Lead>

			<H2>DocsSidebar</H2>
			<P>
				Collapsible sections with an active-item highlight and a mobile drawer
				(≤820px). Data comes in as <C>DocsNavSection[]</C>.
			</P>
			<CodeBlock
				file="DocsPage.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`<DocsSidebar
  sections={NAV}            // { label, icon: IconName, items: { slug, title, badge? }[] }[]
  current={slug}
  onNavigate={(slug) => go(slug)}
  open={drawerOpen}         // mobile drawer state
  onClose={() => setDrawerOpen(false)}
/>`}
			/>

			<H2>DocsToc</H2>
			<P>
				The "On this page" outline. Feed it headings from <C>useDocHeadings</C>{" "}
				— the active item follows the scroll (scrollspy).
			</P>
			<CodeBlock
				file="DocsPage.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`const { headings, activeId, jump } = useDocHeadings({ contentRef, scrollerRef, pageKey: slug });

<DocsToc
  headings={headings}
  activeId={activeId}
  onJump={jump}
  editHref="https://github.com/you/repo"   // optional footer links
  issueHref="https://github.com/you/repo/issues"
/>`}
			/>

			<H2>Breadcrumbs</H2>
			<CodeBlock
				lang="tsx"
				code={`<Breadcrumbs items={["Docs", section, title]} />`}
			/>
			<PropsReference props={propsToRows(breadcrumbs.props)} />

			<H2>PrevNextNav</H2>
			<CodeBlock
				lang="tsx"
				code={`<PrevNextNav
  prev={prev}                       // { title } | null
  next={next}
  onPrev={() => go(prev.slug)}
  onNext={() => go(next.slug)}
/>`}
			/>
			<PropsReference props={propsToRows(prevNextNav.props)} />

			<Callout type="info" title="Bring your own router">
				None of these components import a router. The sidebar on this site
				renders its items through <C>@dennation/menu</C>, whose <C>Item</C> is a
				TanStack Router <C>&lt;Link&gt;</C>; yours can render anything.
			</Callout>
			<DocsFooter
				prev={{ to: "/docs/search", title: "Search" }}
				next={{ to: "/docs/copy-command", title: "CopyCommand" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/navigation")({
	component: PageNavigation,
});
