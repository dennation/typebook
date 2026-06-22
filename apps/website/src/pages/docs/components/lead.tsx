import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageLead() {
	return (
		<>
			<Lead>
				<InlineCode>Lead</InlineCode> is the large, muted intro paragraph that
				sits directly under a page title — a one-line summary that sets up the
				page. The sentence you are reading is a <InlineCode>Lead</InlineCode>.
			</Lead>

			<Heading level={2}>When to use it</Heading>
			<Paragraph>
				Open each docs page with exactly one <InlineCode>Lead</InlineCode>: a
				single sentence that says what the thing is. Body copy that follows uses{" "}
				<InlineCode>Paragraph</InlineCode> — <InlineCode>Lead</InlineCode> is
				just the larger, muted variant reserved for that opening line.
			</Paragraph>

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
