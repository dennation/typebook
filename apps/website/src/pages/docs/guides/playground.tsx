import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	List,
	Paragraph,
	PropsReference,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PagePlayground() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Playground>"}</InlineCode> is the interactive story: a
				live preview on top, an editable props table below. Controls are derived
				from the extracted TypeScript types — no manual arg configuration.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Playground } from "@dennation/typebook/react";

<Playground of={meta} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>What the table gives you</Heading>
			<List.Root>
				<List.Item>
					A control per prop: literal unions become selects, booleans toggles,
					strings and numbers inputs
				</List.Item>
				<List.Item>
					Search across prop names and a toggle for inherited props
				</List.Item>
				<List.Item>
					Required props are marked; defaults and JSDoc descriptions come from
					the registry
				</List.Item>
			</List.Root>

			<Callout type="info" title="Where the metadata comes from">
				The table is driven by <InlineCode>PropInfo[]</InlineCode> that the
				bundler plugin extracted at build time — types, optionality, default
				values from destructuring, and JSDoc comments.
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
								<InlineCode>getComponentMeta()</InlineCode>. Initial control
								values come from its <InlineCode>defaultProps</InlineCode>.
							</>
						),
					},
				]}
			/>
			<Paragraph>
				Props that can't be edited as plain values (functions, nodes, complex
				objects) are shown read-only with their type.
			</Paragraph>
			<DocsFooter
				prev={{ to: "/docs/guides/story", title: "Rendering stories" }}
				next={{ to: "/docs/guides/snippet", title: "Live snippets" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/playground")({
	component: PagePlayground,
});
