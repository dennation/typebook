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
import { SquareStack, Table } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";
import {
	FunctionSignature,
	ref,
	txt,
} from "../../../widgets/docs/FunctionSignature";

function PagePropsToRows() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				Maps a handle's extracted <InlineCode>props</InlineCode> into the row
				shape <InlineCode>PropsReference</InlineCode> renders — so a docs props
				table can be sourced from the component's own types instead of written
				by hand.
			</Lead>

			<Heading level={2}>Signature</Heading>
			<FunctionSignature
				tokens={[
					txt("function propsToRows(\n  "),
					ref("props", "#parameters"),
					txt(": PropInfo[],\n  "),
					ref("includeInherited", "#parameters"),
					txt("?: boolean,\n): "),
					ref("PropRowData[]", "#returns"),
				]}
			/>

			<Heading level={2}>Parameters</Heading>
			<PropsReference
				props={[
					{
						name: "props",
						type: "PropInfo[]",
						required: true,
						desc: "The extracted prop metadata — usually the props from defineStories.",
					},
					{
						name: "includeInherited",
						type: "boolean",
						required: false,
						default: "false",
						desc: "Keep props inherited from framework types (e.g. React.HTMLAttributes). Dropped by default.",
					},
				]}
			/>

			<Heading level={2}>Returns</Heading>
			<Paragraph>
				A <InlineCode>PropRowData[]</InlineCode> — one row per prop with{" "}
				<InlineCode>name</InlineCode>, formatted <InlineCode>type</InlineCode>,{" "}
				<InlineCode>required</InlineCode>, <InlineCode>default</InlineCode>,{" "}
				<InlineCode>deprecated</InlineCode> and <InlineCode>desc</InlineCode>,
				ready to pass straight to <InlineCode>PropsReference</InlineCode>.
			</Paragraph>

			<Heading level={2}>Example</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab file="button.tsx" lang="tsx">{`import {
  defineStories,
  propsToRows,
  PropsReference,
} from "@dennation/typebook/react"
import { Button } from "../components/Button"

const ButtonStories = defineStories(Button)

// auto props table from the component's types
<PropsReference props={propsToRows(ButtonStories.props)} />`}</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Notes</Heading>
			<Callout type="info" title="Empty without the plugin">
				The rows come from <InlineCode>handle.props</InlineCode>, which the
				bundler plugin fills at build time. Without the plugin the table renders
				empty rather than failing.
			</Callout>

			<Heading level={2}>Related</Heading>
			<Cards>
				<DocCard
					icon={<Table size={20} />}
					title="Tables"
					desc="PropsReference and MDTable in the docs kit."
					onClick={() => navigate({ to: "/docs/components/tables" })}
				/>
				<DocCard
					icon={<SquareStack size={20} />}
					title="Stories"
					desc="defineStories, whose props this maps."
					onClick={() => navigate({ to: "/docs/plugins/stories" })}
				/>
			</Cards>

			<DocsFooter
				prev={{ to: "/docs/plugins/stories", title: "Stories" }}
				next={{ to: "/docs/functions/slugify", title: "slugify" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/functions/props-to-rows")({
	component: PagePropsToRows,
});
