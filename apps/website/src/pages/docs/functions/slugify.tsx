import {
	Cards,
	CodeBlock,
	DocCard,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
} from "@dennation/typebook/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Hash, Type } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageSlugify() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Turns heading text into a URL-friendly anchor id — lowercased, stripped
				of punctuation, spaces collapsed to hyphens. The same helper{" "}
				<InlineCode>Heading</InlineCode> uses to derive its anchor, exported so
				a consumer can link to the same ids.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function slugify("),
					ref("s", "#parameters"),
					txt(": string): "),
					ref("string", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "s",
						type: "string",
						required: true,
						desc: "The text to slugify — typically a heading's plain text.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>string</InlineCode> anchor id: lowercased, with everything
				but word characters, spaces and hyphens removed, trimmed, and inner
				whitespace replaced by single hyphens.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="ts">{`slugify("On this page")   // → "on-this-page"
slugify("getComponentMeta()") // → "getcomponentmeta"`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Matching Heading ids</Heading>
			<Paragraph>
				Pair it with <InlineCode>childText</InlineCode> to reproduce a heading's
				id from its children, then link to <InlineCode>#{"{id}"}</InlineCode>.
			</Paragraph>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Type size={20} />}
					title="childText"
					desc="Extract plain text to feed slugify."
					onClick={() => navigate({ to: "/docs/functions/child-text" })}
				/>
				<DocCard
					icon={<Hash size={20} />}
					title="Headings"
					desc="Anchored section titles built on slugify."
					onClick={() => navigate({ to: "/docs/components/headings" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/functions/props-to-rows", title: "propsToRows" }}
				next={{ to: "/docs/functions/child-text", title: "childText" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/slugify")({
	component: PageSlugify,
});
