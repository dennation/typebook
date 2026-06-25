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
import { Layers, Sparkles } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageValues() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Builds a variant axis from an explicit list of values you choose. Use it
				when a prop has no enumerable type to read — a string, a number, a node
				— or when you only want a hand-picked subset of a union.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function values<R, K extends keyof PropsOf<R>>(\n  "),
					ref("of", "#parameters"),
					txt(": R,\n  "),
					ref("prop", "#parameters"),
					txt(": K,\n  "),
					ref("values", "#parameters"),
					txt(": PropsOf<R>[K][],\n): "),
					ref("ValuesConfig", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "of",
						type: "R extends ComponentMeta",
						required: true,
						desc: "The handle from getComponentMeta — types prop and the value list against it.",
					},
					{
						name: "prop",
						type: "keyof PropsOf<R>",
						required: true,
						desc: "The prop the axis varies.",
					},
					{
						name: "values",
						type: "PropsOf<R>[K][]",
						required: true,
						desc: "The explicit values to render — each is type-checked against the prop's type.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>ValuesConfig</InlineCode> marker —{" "}
				<InlineCode>{`{ __type: "values", prop, values }`}</InlineCode>. Unlike{" "}
				<InlineCode>allOf</InlineCode>, the values are carried on the marker
				itself, so it does not depend on the injected prop metadata.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.tsx"
					lang="tsx"
				>{`import { getComponentMeta, values, Variants } from "@dennation/typebook/react"
import { Button } from "../components/Button"

const button = getComponentMeta(Button, { defaultProps: { children: "Click me" } })

// a hand-picked subset, each value type-checked against \`size\`
<Variants of={button} items={values(button, "size", ["sm", "lg"])} />`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Callout type="info" title="No plugin needed">
				Because the values are written by hand, <InlineCode>values</InlineCode>{" "}
				works without the bundler plugin — there is nothing to extract. Reach
				for it when a prop's type is not a finite union, or when{" "}
				<InlineCode>allOf</InlineCode> would produce too many cells.
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
					icon={<Sparkles size={20} />}
					title="generate"
					desc="An axis from a generator function."
					onClick={() => navigate({ to: "/docs/functions/generate" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/functions/all-of", title: "allOf" }}
				next={{ to: "/docs/functions/generate", title: "generate" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/values")({
	component: PageValues,
});
