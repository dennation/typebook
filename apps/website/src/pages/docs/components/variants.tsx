import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageVariants() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Variants>"}</InlineCode> renders a labeled grid of
				component variants along one prop axis. The axis is described by a
				variant config — <InlineCode>allOf()</InlineCode>,{" "}
				<InlineCode>values()</InlineCode> or <InlineCode>generate()</InlineCode>
				.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
					showLineNumbers
				>
					{`import { allOf, values } from "@dennation/typebook/react";
import { Variants } from "@dennation/typebook/react";

// every value of a literal-union prop, straight from its TS type
<Variants of={meta} items={allOf(meta, "size")} />

// or an explicit, typed list
<Variants of={meta} items={values(meta, "size", ["sm", "lg"])} columns={2} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="success" title="Variants come from types">
				<InlineCode>allOf()</InlineCode> reads the prop's literal-union (or
				boolean) type from the handle's injected <InlineCode>props</InlineCode>{" "}
				— add a value to the union and the grid grows by itself.
			</Callout>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "of",
						type: "ComponentMeta",
						required: true,
						desc: (
							<>
								The handle returned by{" "}
								<InlineCode>getComponentMeta()</InlineCode>.
							</>
						),
					},
					{
						name: "items",
						type: "VariantConfig",
						required: true,
						desc: (
							<>
								The axis: <InlineCode>allOf(of, prop)</InlineCode>,{" "}
								<InlineCode>values(of, prop, vs)</InlineCode> or{" "}
								<InlineCode>generate(of, prop, fn, n)</InlineCode>.
							</>
						),
					},
					{
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: "Base props applied to every variant in the grid.",
					},
					{
						name: "columns",
						type: "number",
						desc: "Fixed column count; by default the grid adapts to the variant count.",
					},
					{
						name: "title",
						type: "string",
						desc: "Optional caption shown above the grid.",
					},
					{
						name: "showSource",
						type: "boolean",
						desc: 'Show a "show source" toggle on each cell (on by default).',
					},
					{
						name: "interactive",
						type: "boolean",
						desc: (
							<>
								Make each cell's props editable in place — see{" "}
								<Link to="/docs/guides/interactive">Interactive props</Link>.
							</>
						),
					},
					{
						name: "isolate",
						type: "boolean",
						desc: "Render each variant inside an iframe.",
					},
				]}
			/>

			<Heading level={2}>Related</Heading>
			<Paragraph>
				One variant at a time? Use{" "}
				<Link to="/docs/components/story">Story</Link>. Two axes crossed in a
				table? Use <Link to="/docs/components/matrix">Matrix</Link>. For the big
				picture see <Link to="/docs/guides/story">Rendering stories</Link>.
			</Paragraph>
			<DocsFooter
				prev={{ to: "/docs/components/story", title: "Story" }}
				next={{ to: "/docs/components/matrix", title: "Matrix" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/variants")({
	component: PageVariants,
});
