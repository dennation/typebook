import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageLayout() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Layout>"}</InlineCode> is the runtime shell for a
				Typebook page: it sets the <InlineCode>data-theme</InlineCode>{" "}
				attribute, injects the package stylesheet on first mount, and lays out
				an optional sidebar next to the scrollable content.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<Paragraph>
				Wrap your route's outlet in <InlineCode>{"<Layout>"}</InlineCode> and
				pass a <InlineCode>sidebar</InlineCode> node. With a sidebar the root
				becomes a two-column grid (<InlineCode>260px</InlineCode> + content);
				without one the content scrolls full-width.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/__root.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Layout } from "@dennation/typebook/react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({ component: RootComponent });

function RootComponent() {
  return (
    <Layout sidebar={<nav><Link to="/">Home</Link></nav>}>
      <Outlet />
    </Layout>
  );
}`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Paragraph>
				<InlineCode>Layout</InlineCode> reads the current theme through the
				package's theme entity, so a{" "}
				<Link to="/docs/components/theme-toggle">ThemeToggle</Link> placed
				anywhere inside swaps the whole page through the cascade. Pass{" "}
				<InlineCode>theme</InlineCode> to pin a page to a fixed theme regardless
				of the user's choice.
			</Paragraph>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "children",
						type: "ReactNode",
						required: true,
						desc: "The page content rendered in the scrollable area.",
					},
					{
						name: "sidebar",
						type: "ReactNode",
						desc: "Optional sidebar node. When present the shell becomes a 260px + content grid.",
					},
					{
						name: "theme",
						type: '"light" | "dark"',
						desc: "Pin the page to a fixed theme instead of following the user's preference.",
					},
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/components/copy-command", title: "CopyCommand" }}
				next={{ to: "/docs/components/button", title: "Button" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/layout")({
	component: PageLayout,
});
