import { C, CodeBlock, Heading, Lead } from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageLead() {
	return (
		<>
			<Lead>
				<C>Lead</C> is the large, muted intro paragraph that sits directly under
				a page title — a one-line summary that sets up the page. The sentence
				you are reading is a <C>Lead</C>.
			</Lead>

			<Heading level={2}>When to use it</Heading>
			<p>
				Open each docs page with exactly one <C>Lead</C>: a single sentence that
				says what the thing is. Body copy that follows is plain <C>{"<p>"}</C>,
				styled by the <C>.doc-prose</C> layer. <C>Lead</C> has no Markdown
				equivalent, which is why it stays a component rather than a bare tag.
			</p>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Lead } from "@dennation/typebook/react";

<Lead>One-line summary under the page title.</Lead>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/headings", title: "Headings" }}
				next={{ to: "/docs/components/inline-code", title: "Inline code" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/lead")({
	component: PageLead,
});
