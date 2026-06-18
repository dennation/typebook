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
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";
import { useDocsGo } from "../widgets/docs/useDocsGo";

function PageLayout() {
	const go = useDocsGo();
	return (
		<>
			<Lead>
				<C>{"<Layout>"}</C> is the runtime shell for a Typebook page: it sets
				the <C>data-theme</C> attribute, injects the package stylesheet on first
				mount, and lays out an optional sidebar next to the scrollable content.
			</Lead>

			<H2>Usage</H2>
			<P>
				Wrap your route's outlet in <C>{"<Layout>"}</C> and pass a{" "}
				<C>sidebar</C> node. With a sidebar the root becomes a two-column grid (
				<C>260px</C> + content); without one the content scrolls full-width.
			</P>
			<CodeBlock
				file="src/pages/__root.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Layout } from "@dennation/typebook/react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({ component: RootComponent });

function RootComponent() {
  return (
    <Layout sidebar={<nav><Link to="/">Home</Link></nav>}>
      <Outlet />
    </Layout>
  );
}`}
			/>

			<P>
				<C>Layout</C> reads the current theme through the package's theme
				entity, so a <A onClick={() => go("theme-toggle")}>ThemeToggle</A>{" "}
				placed anywhere inside swaps the whole page through the cascade. Pass{" "}
				<C>theme</C> to pin a page to a fixed theme regardless of the user's
				choice.
			</P>

			<H2>Props</H2>
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
				prev={{ to: "/docs/copy-command", title: "CopyCommand" }}
				next={{ to: "/docs/button", title: "Button" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/layout")({ component: PageLayout });
