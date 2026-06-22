import {
	Breadcrumbs,
	C,
	Callout,
	CodeBlock,
	getComponentMeta,
	Heading,
	Lead,
	PrevNextNav,
	PropsReference,
	propsToRows,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const breadcrumbsMeta = getComponentMeta(Breadcrumbs);
const prevNextNavMeta = getComponentMeta(PrevNextNav);

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

			<Heading level={2}>DocsSidebar</Heading>
			<p>
				Collapsible sections with an active-item highlight and a mobile drawer
				(≤820px). Data comes in as <C>DocsNavSection[]</C>.
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="DocsPage.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<DocsSidebar
  sections={NAV}            // { label, icon: ReactNode, items: { slug, title, badge? }[] }[]
  current={slug}
  onNavigate={(slug) => go(slug)}
  open={drawerOpen}         // mobile drawer state
  onClose={() => setDrawerOpen(false)}
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>DocsToc</Heading>
			<p>
				The "On this page" outline. Feed it headings from <C>useDocHeadings</C>{" "}
				— the active item follows the scroll (scrollspy).
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="DocsPage.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`const { headings, activeId, jump } = useDocHeadings({ contentRef, scrollerRef, pageKey: slug });

<DocsToc
  headings={headings}
  activeId={activeId}
  onJump={jump}
  editHref="https://github.com/you/repo"   // optional footer links
  issueHref="https://github.com/you/repo/issues"
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Breadcrumbs</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`<Breadcrumbs items={["Docs", section, title]} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<PropsReference props={propsToRows(breadcrumbsMeta.props)} />

			<Heading level={2}>PrevNextNav</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`<PrevNextNav
  prev={prev}                       // { title } | null
  next={next}
  onPrev={() => go(prev.slug)}
  onNext={() => go(next.slug)}
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<PropsReference props={propsToRows(prevNextNavMeta.props)} />

			<Callout type="info" title="Bring your own router">
				None of these components import a router. The sidebar on this site
				renders its items through <C>@dennation/menu</C>, whose <C>Item</C> is a
				TanStack Router <C>&lt;Link&gt;</C>; yours can render anything.
			</Callout>
			<DocsFooter
				prev={{
					to: "/docs/components/image-placeholder",
					title: "Image placeholder",
				}}
				next={{ to: "/docs/components/copy-command", title: "CopyCommand" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/navigation")({
	component: PageNavigation,
});
