import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageInlineCode() {
	return (
		<>
			<Lead>
				<InlineCode>InlineCode</InlineCode> renders inline code — short
				monospace fragments inside running text, like{" "}
				<InlineCode>useDocHeadings()</InlineCode> or{" "}
				<InlineCode>--accent</InlineCode>. It applies the{" "}
				<InlineCode>.inline-code</InlineCode> theme class.
			</Lead>

			<Heading level={2}>Inline, not a block</Heading>
			<Paragraph>
				<InlineCode>InlineCode</InlineCode> is for short fragments{" "}
				<Strong>inside</Strong> running text — a prop name, a token, a value.
				For a whole highlighted snippet use <InlineCode>CodeBlock</InlineCode>{" "}
				instead. It carries the <InlineCode>.inline-code</InlineCode> class, so
				it looks the same wherever it appears — including inside callouts,
				tables, tabs and cards.
			</Paragraph>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { InlineCode } from "@dennation/typebook/react";

<Paragraph>Read the value from <InlineCode>import.meta.env</InlineCode>.</Paragraph>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/lead", title: "Lead" }}
				next={{ to: "/docs/components/link", title: "Link" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/inline-code")({
	component: PageInlineCode,
});
