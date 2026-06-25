import {
	Callout,
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
import { Layers, ListChecks } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageGenerate() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Builds a variant axis by calling a function once per cell. Use it for
				props whose interesting values aren't a fixed list — random data, an
				index-derived label, a generated node — when you want{" "}
				<InlineCode>count</InlineCode> distinct samples.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function generate<R, K extends keyof PropsOf<R>>(\n  "),
					ref("of", "#parameters"),
					txt(": R,\n  "),
					ref("prop", "#parameters"),
					txt(": K,\n  "),
					ref("fn", "#parameters"),
					txt(": () => PropsOf<R>[K],\n  "),
					ref("count", "#parameters"),
					txt(": number,\n): "),
					ref("GenerateConfig", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "of",
						type: "R extends ComponentMeta",
						required: true,
						desc: "The handle from getComponentMeta — types prop and fn's return against it.",
					},
					{
						name: "prop",
						type: "keyof PropsOf<R>",
						required: true,
						desc: "The prop the axis varies.",
					},
					{
						name: "fn",
						type: "() => PropsOf<R>[K]",
						required: true,
						desc: "Called once per cell. Its return type is constrained to the prop's type.",
					},
					{
						name: "count",
						type: "number",
						required: true,
						desc: "How many cells to generate.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>GenerateConfig</InlineCode> marker —{" "}
				<InlineCode>{`{ __type: "generate", prop, fn, count }`}</InlineCode>.
				The function is invoked at render time, once for each of{" "}
				<InlineCode>count</InlineCode> cells.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="avatar.tsx"
					lang="tsx"
				>{`import { generate, getComponentMeta, Variants } from "@dennation/typebook/react"
import { Avatar } from "../components/Avatar"

const avatar = getComponentMeta(Avatar)

// five avatars, each with a freshly generated label
<Variants of={avatar} items={generate(avatar, "label", () => randomName(), 5)} />`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Callout type="warning" title="Called on every render">
				<InlineCode>fn</InlineCode> runs each time the axis renders, so a
				non-deterministic generator produces different cells across renders.
				Seed it if you need stable output between reloads.
			</Callout>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Layers size={20} />}
					title="allOf"
					desc="Every value of a literal-union or boolean type."
					onClick={() => navigate({ to: "/docs/functions/all-of" })}
				/>
				<DocCard
					icon={<ListChecks size={20} />}
					title="values"
					desc="An axis from an explicit list."
					onClick={() => navigate({ to: "/docs/functions/values" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/functions/values", title: "values" }}
				next={{ to: "/docs/functions/props-to-rows", title: "propsToRows" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/generate")({
	component: PageGenerate,
});
