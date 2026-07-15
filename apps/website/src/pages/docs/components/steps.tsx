import {
	CodeBlock,
	defineStories,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	propsToRows,
	Snippet,
	Step,
	Steps,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = defineStories(Step);

function PageSteps() {
	return (
		<>
			<Lead>
				<InlineCode>Steps</InlineCode> renders a numbered procedure with a
				connector line. The counters and the line are pure CSS (counters +
				pseudo-elements from the theme layer), so the markup stays minimal.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Snippet name="steps-example">
				{() => (
					<Steps.Root>
						<Steps.Step title="Install the package">
							<Paragraph>
								Any content works inside a step — paragraphs, code blocks,
								callouts.
							</Paragraph>
						</Steps.Step>
						<Steps.Step title="Wire the plugin">
							<CodeBlock.Root>
								<CodeBlock.Tab lang="bash">
									{`pnpm add @dennation/typebook`}
								</CodeBlock.Tab>
							</CodeBlock.Root>
						</Steps.Step>
						<Steps.Step title="Render a story">
							<Paragraph>
								The connector line stops automatically at the last step.
							</Paragraph>
						</Steps.Step>
					</Steps.Root>
				)}
			</Snippet>

			<Heading level={2}>Props</Heading>
			<Paragraph>
				<InlineCode>Steps</InlineCode> takes only{" "}
				<InlineCode>children</InlineCode>. Each <InlineCode>Step</InlineCode>{" "}
				accepts:
			</Paragraph>
			<PropsReference props={propsToRows(meta.props)} />
			<DocsFooter
				prev={{ to: "/docs/components/tabs", title: "Tabs" }}
				next={{ to: "/docs/components/cards", title: "Cards" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/steps")({
	component: PageSteps,
});
