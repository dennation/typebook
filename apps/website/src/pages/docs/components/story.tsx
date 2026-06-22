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

function PageStory() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Story>"}</InlineCode> renders a single variant of a
				registered component inside a preview frame — the component with its{" "}
				<InlineCode>defaultProps</InlineCode> merged with whatever you pass via{" "}
				<InlineCode>props</InlineCode>.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Story } from "@dennation/typebook/react";

<Story of={button} />
<Story of={button} props={{ size: "lg", children: "Large" }} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="info" title="Type-safe props">
				The <InlineCode>props</InlineCode> prop is phantom-typed: if the
				component has required props that <InlineCode>defaultProps</InlineCode>{" "}
				doesn't cover, TypeScript makes <InlineCode>props</InlineCode> mandatory
				and demands exactly the missing keys.
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
						name: "props",
						type: "Partial<Props> & MissingProps",
						desc: (
							<>
								Per-story prop overrides; merged over{" "}
								<InlineCode>defaultProps</InlineCode>. Required when the
								registration leaves required props uncovered.
							</>
						),
					},
					{
						name: "isolate",
						type: "boolean",
						desc: "Render the preview inside an iframe to isolate styles and layout.",
					},
				]}
			/>

			<Heading level={2}>Related</Heading>
			<Paragraph>
				Need several values of one prop at once? Use{" "}
				<Link to="/docs/components/variants">Variants</Link>. Two axes? Use{" "}
				<Link to="/docs/components/matrix">Matrix</Link>. For the big picture
				see <Link to="/docs/guides/story">Rendering stories</Link>.
			</Paragraph>
			<DocsFooter
				prev={{ to: "/docs/guides/icons", title: "Icons" }}
				next={{ to: "/docs/components/variants", title: "Variants" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/story")({
	component: PageStory,
});
