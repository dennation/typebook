import {
	CodeBlock,
	ErrorBoundary,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function Boom(): never {
	throw new Error("Something went wrong rendering this component.");
}

function PageErrorBoundary() {
	return (
		<>
			<Lead>
				<InlineCode>ErrorBoundary</InlineCode> catches render errors in its
				subtree and shows a fallback instead of crashing the page. The preview
				frames around <InlineCode>{"<Story>"}</InlineCode> and friends wrap each
				variant in one, so a single broken example never takes down the whole
				page.
			</Lead>

			<Heading level={2}>Example</Heading>
			<Paragraph>
				The child below throws on render; the boundary renders its default
				fallback (the error message) in place:
			</Paragraph>
			<Snippet name="error-boundary-example">
				{() => (
					<ErrorBoundary>
						<Boom />
					</ErrorBoundary>
				)}
			</Snippet>

			<Heading level={2}>Custom fallback</Heading>
			<Paragraph>
				Pass <InlineCode>fallback</InlineCode> to replace the default red error
				box with your own node.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`import { ErrorBoundary } from "@dennation/typebook/react";

<ErrorBoundary fallback={<p>Couldn't render this example.</p>}>
  <RiskyComponent />
</ErrorBoundary>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "children",
						type: "ReactNode",
						required: true,
						desc: "The subtree to guard.",
					},
					{
						name: "fallback",
						type: "ReactNode",
						desc: "Custom node shown when a child throws. Defaults to a red box with the error message.",
					},
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/components/theme-toggle", title: "ThemeToggle" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/error-boundary")({
	component: PageErrorBoundary,
});
