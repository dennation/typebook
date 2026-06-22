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

function PageHeadings() {
	return (
		<>
			<Lead>
				<InlineCode>Heading</InlineCode> renders an anchored section title. It
				derives an id from its text (via <InlineCode>slugify</InlineCode>),
				shows a hover-revealed <InlineCode>#</InlineCode> link, and carries the{" "}
				<InlineCode>.doc-h2</InlineCode>/<InlineCode>.doc-h3</InlineCode> hook
				that <InlineCode>useDocHeadings</InlineCode> collects for the table of
				contents.
			</Lead>

			<Heading level={2}>Levels</Heading>
			<Paragraph>
				One component, two levels. <InlineCode>level={2}</InlineCode> is a
				section heading (renders <InlineCode>{"<h2>"}</InlineCode> with the{" "}
				<InlineCode>.doc-h2</InlineCode> hook);{" "}
				<InlineCode>level={3}</InlineCode> is a subsection (
				<InlineCode>{"<h3>"}</InlineCode> / <InlineCode>.doc-h3</InlineCode>).
				Every heading on this page — including the one above — is a{" "}
				<InlineCode>Heading</InlineCode>.
			</Paragraph>

			<Heading level={3}>A subsection</Heading>
			<Paragraph>
				This title is a <InlineCode>level={3}</InlineCode> heading. The table of
				contents on the right nests it under the section above.
			</Paragraph>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Heading } from "@dennation/typebook/react";

<Heading level={2}>Section</Heading>
<Heading level={3}>Subsection</Heading>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/tables", title: "Tables" }}
				next={{ to: "/docs/components/lead", title: "Lead" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/headings")({
	component: PageHeadings,
});
