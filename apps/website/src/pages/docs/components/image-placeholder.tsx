import {
	CodeBlock,
	Heading,
	ImagePlaceholder,
	InlineCode,
	Lead,
	Paragraph,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageImagePlaceholder() {
	return (
		<>
			<Lead>
				<InlineCode>ImagePlaceholder</InlineCode> is a hatched stand-in shown
				where the docs will eventually display a screenshot or diagram, so a
				page can be laid out before the real art exists.
			</Lead>

			<Heading level={2}>Example</Heading>
			<ImagePlaceholder
				label="diagram.png — hatched placeholder while real art is pending"
				height={140}
			/>

			<Heading level={2}>Props</Heading>
			<Paragraph>
				<InlineCode>label</InlineCode> sets the centered caption (defaults to{" "}
				<InlineCode>"screenshot"</InlineCode>), and{" "}
				<InlineCode>height</InlineCode> overrides the default block height in
				pixels.
			</Paragraph>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { ImagePlaceholder } from "@dennation/typebook/react";

<ImagePlaceholder label="hero.png" height={140} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<DocsFooter
				prev={{ to: "/docs/components/link", title: "Link" }}
				next={{ to: "/docs/components/navigation", title: "Navigation" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/image-placeholder")({
	component: PageImagePlaceholder,
});
