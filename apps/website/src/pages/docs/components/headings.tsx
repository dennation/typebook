import { C, CodeBlock, Heading, Lead } from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageHeadings() {
	return (
		<>
			<Lead>
				<C>Heading</C> renders an anchored section title. It derives an id from
				its text (via <C>slugify</C>), shows a hover-revealed <C>#</C> link, and
				carries the <C>.doc-h2</C>/<C>.doc-h3</C> hook that{" "}
				<C>useDocHeadings</C> collects for the table of contents.
			</Lead>

			<Heading level={2}>Levels</Heading>
			<p>
				One component, two levels. <C>level={2}</C> is a section heading
				(renders <C>{"<h2>"}</C> with the <C>.doc-h2</C> hook); <C>level={3}</C>{" "}
				is a subsection (<C>{"<h3>"}</C> / <C>.doc-h3</C>). Every heading on
				this page — including the one above — is a <C>Heading</C>.
			</p>

			<Heading level={3}>A subsection</Heading>
			<p>
				This title is a <C>level={3}</C> heading. The table of contents on the
				right nests it under the section above.
			</p>

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
