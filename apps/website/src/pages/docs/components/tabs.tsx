import {
	Emphasis,
	getComponentMeta,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	propsToRows,
	Snippet,
	Tabs,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = getComponentMeta(Tabs);

function PageTabs() {
	return (
		<>
			<Lead>
				<InlineCode>Tabs</InlineCode> switches between related panels of content
				with an underline-style tab bar. For tabbed <Emphasis>code</Emphasis>,
				prefer <InlineCode>CodeBlock</InlineCode>'s own{" "}
				<InlineCode>CodeBlock.Tab</InlineCode> children — this component is for
				arbitrary content.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="tabs-example">
				{() => (
					<Tabs
						tabs={[
							{
								label: "First",
								content: <Paragraph>Content of the first panel.</Paragraph>,
							},
							{
								label: "Second",
								content: (
									<Paragraph>
										Content of the second panel — any ReactNode works.
									</Paragraph>
								),
							},
						]}
					/>
				)}
			</Snippet>

			<Heading level={2}>Props</Heading>
			<PropsReference props={propsToRows(meta.props)} />
			<DocsFooter
				prev={{ to: "/docs/components/code-block", title: "CodeBlock" }}
				next={{ to: "/docs/components/steps", title: "Steps" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/tabs")({
	component: PageTabs,
});
