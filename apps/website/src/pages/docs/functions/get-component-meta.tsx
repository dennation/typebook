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
import { Layers, SquareStack } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PageGetComponentMeta() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Registers a component and returns a self-contained handle that{" "}
				<InlineCode>Story</InlineCode>, <InlineCode>Variants</InlineCode> and{" "}
				<InlineCode>Matrix</InlineCode> read from. It is the entry point to
				everything else — no registry, no context, no lookup by key.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function getComponentMeta<Props>(\n  "),
					ref("component", "#parameters"),
					txt(": ComponentType<Props>,\n  "),
					ref("config", "#parameters"),
					txt("?: MetaConfigPick<Props> | MetaConfigOmit<Props>,\n): "),
					ref("ComponentMeta<Props>", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "component",
						type: "ComponentType<Props>",
						required: true,
						desc: "The component to document.",
					},
					{
						name: "config",
						type: "MetaConfigPick | MetaConfigOmit",
						required: false,
						desc: "defaultProps plus an optional pick / omit list to scope which props appear in the props table.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>ComponentMeta</InlineCode> handle — a plain object the
				story views read everything from:
			</Paragraph>
			<PropsReference
				props={[
					{
						name: "component",
						type: "ComponentType",
						desc: "The registered component reference.",
					},
					{
						name: "defaultProps",
						type: "Record<string, unknown>",
						desc: "Defaults applied to every render of this component.",
					},
					{
						name: "props",
						type: "PropInfo[]",
						desc: "Extracted prop metadata. Empty as authored — the bundler plugin injects the real array at build time.",
					},
				]}
			/>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="button.tsx"
					lang="tsx"
				>{`import { getComponentMeta, Story } from "@dennation/typebook/react"
import { Button } from "../components/Button"

const button = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
})

<Story of={button} />`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Callout type="info" title="props is injected at build time">
				As authored, <InlineCode>props</InlineCode> is{" "}
				<InlineCode>[]</InlineCode>. The bundler plugin extracts the real{" "}
				<InlineCode>PropInfo[]</InlineCode> via the TypeScript Compiler API and
				injects it into the call. Without the plugin (plain{" "}
				<InlineCode>tsc</InlineCode> or tests) the handle still type-checks —{" "}
				<InlineCode>props</InlineCode> just stays empty and{" "}
				<InlineCode>Variants</InlineCode> / <InlineCode>Matrix</InlineCode>{" "}
				degrade gracefully.
			</Callout>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Layers size={20} />}
					title="allOf"
					desc="Build a variant axis from a prop's type."
					onClick={() => navigate({ to: "/docs/functions/all-of" })}
				/>
				<DocCard
					icon={<SquareStack size={20} />}
					title="Story"
					desc="Render a single variant from the handle."
					onClick={() => navigate({ to: "/docs/components/story" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/components/error-boundary", title: "ErrorBoundary" }}
				next={{ to: "/docs/functions/all-of", title: "allOf" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/get-component-meta")({
	component: PageGetComponentMeta,
});
