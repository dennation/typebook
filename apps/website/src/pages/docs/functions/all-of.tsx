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
import { ListChecks, Sparkles } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageAllOf() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Builds a variant axis from a prop's TypeScript type — every member of a
				literal union, or both booleans. The axis you hand to{" "}
				<InlineCode>Variants</InlineCode> or <InlineCode>Matrix</InlineCode> to
				render one cell per value, with no values written by hand.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function allOf<R, K extends keyof PropsOf<R>>(\n  "),
					ref("of", "#parameters"),
					txt(": R,\n  "),
					ref("prop", "#parameters"),
					txt(": K,\n): "),
					ref("AllOfConfig", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "of",
						type: "R extends ComponentMeta",
						required: true,
						desc: "The handle from getComponentMeta — carries the prop metadata the axis is read from, and types prop against its prop names.",
					},
					{
						name: "prop",
						type: "keyof PropsOf<R>",
						required: true,
						desc: "The prop whose literal-union or boolean type becomes the axis.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				An <InlineCode>AllOfConfig</InlineCode> marker —{" "}
				<InlineCode>{`{ __type: "allOf", prop }`}</InlineCode>. It is resolved
				into the actual list of values at render time, against the handle's
				injected prop metadata.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.tsx"
					lang="tsx"
				>{`import { allOf, getComponentMeta, Variants } from "@dennation/typebook/react"
import { Button } from "../components/Button"

const button = getComponentMeta(Button, { defaultProps: { children: "Click me" } })

// one cell per value of Button's \`size\` union
<Variants of={button} items={allOf(button, "size")} />`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Callout type="info" title="Reads the injected type">
				<InlineCode>allOf</InlineCode> only knows the prop's values because the
				bundler plugin injected them into the handle. The first argument is the
				handle (not just for typing) — it carries the{" "}
				<InlineCode>PropInfo[]</InlineCode> the axis is resolved from. Without
				the plugin the axis resolves empty.
			</Callout>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<ListChecks size={20} />}
					title="values"
					desc="An axis from an explicit list instead of the type."
					onClick={() => navigate({ to: "/docs/functions/values" })}
				/>
				<DocCard
					icon={<Sparkles size={20} />}
					title="generate"
					desc="An axis from a generator function."
					onClick={() => navigate({ to: "/docs/functions/generate" })}
				/>
			</Cards>

			<DocsFooter
				prev={{
					to: "/docs/functions/get-component-meta",
					title: "getComponentMeta",
				}}
				next={{ to: "/docs/functions/values", title: "values" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/all-of")({
	component: PageAllOf,
});
