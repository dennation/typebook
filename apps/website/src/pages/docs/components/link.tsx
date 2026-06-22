import { A, C, CodeBlock, Heading, Lead } from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageLink() {
	return (
		<>
			<Lead>
				<C>A</C> is the accent-colored inline link used in running text: the
				accent color, an offset underline, and matching styling for any{" "}
				<C>.inline-code</C> nested inside it.
			</Lead>

			<Heading level={2}>href or onClick</Heading>
			<p>
				Pass <C>href</C> for an ordinary link, like{" "}
				<A href="https://github.com/dennation/typebook">the repository</A>. For
				in-app navigation pass <C>onClick</C> instead — the component calls{" "}
				<C>preventDefault</C> so the router handles the move and the page never
				hard-navigates. This behavior is exactly why <C>A</C> stays a component
				rather than a bare <C>{"<a>"}</C> styled by CSS.
			</p>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { A } from "@dennation/typebook/react";

<p>See <A href="https://example.com">the docs</A>.</p>
<p>Or jump <A onClick={() => navigate("/docs/tabs")}>to Tabs</A>.</p>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/inline-code", title: "Inline code" }}
				next={{
					to: "/docs/components/image-placeholder",
					title: "Image placeholder",
				}}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/link")({
	component: PageLink,
});
