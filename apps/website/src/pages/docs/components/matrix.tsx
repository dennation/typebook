import {
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

function PageMatrix() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Matrix>"}</InlineCode> renders the cross-product of two
				prop axes as a table: one axis across the columns (
				<InlineCode>x</InlineCode>), one or more axes stacked down the rows (
				<InlineCode>y</InlineCode>). Perfect for color × variant sweeps.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { allOf } from "@dennation/typebook/react";
import { Matrix } from "@dennation/typebook/react";

<Matrix
  of={meta}
  x={allOf(meta, "color")}
  y={[allOf(meta, "variant"), allOf(meta, "size")]}
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				Each entry in <InlineCode>y</InlineCode> contributes its own block of
				rows, so two y-axes give you every combination of both against the x
				axis.
			</Paragraph>

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
						name: "x",
						type: "VariantConfig",
						required: true,
						desc: "The column axis.",
					},
					{
						name: "y",
						type: "VariantConfig[]",
						required: true,
						desc: "Row axes; each config produces a block of rows.",
					},
					{
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: "Base props applied to every cell.",
					},
					{
						name: "title",
						type: "string",
						desc: "Optional caption shown above the table.",
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
						desc: "Render each cell inside an iframe.",
					},
				]}
			/>

			<Heading level={2}>Related</Heading>
			<Paragraph>
				A single axis is enough? Use{" "}
				<Link to="/docs/components/variants">Variants</Link>. Just one variant?
				Use <Link to="/docs/components/story">Story</Link>. For the big picture
				see <Link to="/docs/guides/story">Rendering stories</Link>.
			</Paragraph>
			<DocsFooter
				prev={{ to: "/docs/components/variants", title: "Variants" }}
				next={{ to: "/docs/components/callout", title: "Callout" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/matrix")({
	component: PageMatrix,
});
