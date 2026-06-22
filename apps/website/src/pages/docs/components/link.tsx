import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Link,
	Paragraph,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageLink() {
	return (
		<>
			<Lead>
				<InlineCode>Link</InlineCode> is the accent-colored inline link used in
				running text: the accent color, an offset underline, and matching
				styling for any <InlineCode>.inline-code</InlineCode> nested inside it.
			</Lead>

			<Heading level={2}>href or onClick</Heading>
			<Paragraph>
				Pass <InlineCode>href</InlineCode> for an ordinary link, like{" "}
				<Link href="https://github.com/dennation/typebook">the repository</Link>
				. For in-app navigation pass <InlineCode>onClick</InlineCode> instead —
				the component calls <InlineCode>preventDefault</InlineCode> so the
				router handles the move and the page never hard-navigates — behavior a
				plain anchor can't carry on its own.
			</Paragraph>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Link } from "@dennation/typebook/react";

<Paragraph>See <Link href="https://example.com">the docs</Link>.</Paragraph>
<Paragraph>Or jump <Link onClick={() => navigate("/docs/tabs")}>to Tabs</Link>.</Paragraph>`}
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
