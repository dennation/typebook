import {
	C,
	CodeBlock,
	Heading,
	ImgPlaceholder,
	Lead,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageImagePlaceholder() {
	return (
		<>
			<Lead>
				<C>ImgPlaceholder</C> is a hatched stand-in shown where the docs will
				eventually display a screenshot or diagram, so a page can be laid out
				before the real art exists.
			</Lead>

			<Heading level={2}>Example</Heading>
			<ImgPlaceholder
				label="diagram.png — hatched placeholder while real art is pending"
				height={140}
			/>

			<Heading level={2}>Props</Heading>
			<p>
				<C>label</C> sets the centered caption (defaults to <C>"screenshot"</C>
				), and <C>height</C> overrides the default block height in pixels.
			</p>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { ImgPlaceholder } from "@dennation/typebook/react";

<ImgPlaceholder label="hero.png" height={140} />`}
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
