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

function PageChildText() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Extracts plain text from React children, walking nested elements and
				arrays. Used to turn a heading's rich children into the string{" "}
				<InlineCode>slugify</InlineCode> needs for an anchor id.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function childText("),
					ref("node", "#parameters"),
					txt(": ReactNode): "),
					ref("string", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "node",
						type: "ReactNode",
						required: true,
						desc: "Any React children — strings, numbers, elements, arrays, or nested combinations.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>string</InlineCode>: the concatenated text content.
				Nullish and boolean nodes contribute nothing; elements are descended
				into via their <InlineCode>children</InlineCode>.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">{`childText(<>On <strong>this</strong> page</>) // → "On this page"
childText(["a", 1, null, "b"])                // → "a1b"`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Hash size={20} />}
					title="slugify"
					desc="Turn the extracted text into an anchor id."
					onClick={() => navigate({ to: "/docs/functions/slugify" })}
				/>
				<DocCard
					icon={<Type size={20} />}
					title="Headings"
					desc="Anchored titles that combine both helpers."
					onClick={() => navigate({ to: "/docs/components/headings" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/functions/slugify", title: "slugify" }}
				next={{ to: "/docs/functions/cx", title: "cx" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/child-text")({
	component: PageChildText,
});
