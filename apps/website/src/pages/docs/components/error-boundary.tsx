import {
	C,
	CodeBlock,
	ErrorBoundary,
	H2,
	Lead,
	P,
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
				<C>ErrorBoundary</C> catches render errors in its subtree and shows a
				fallback instead of crashing the page. The preview frames around{" "}
				<C>{"<Story>"}</C> and friends wrap each variant in one, so a single
				broken example never takes down the whole page.
			</Lead>

			<H2>Example</H2>
			<P>
				The child below throws on render; the boundary renders its default
				fallback (the error message) in place:
			</P>
			<Snippet name="error-boundary-example">
				{() => (
					<ErrorBoundary>
						<Boom />
					</ErrorBoundary>
				)}
			</Snippet>

			<H2>Custom fallback</H2>
			<P>
				Pass <C>fallback</C> to replace the default red error box with your own
				node.
			</P>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`import { ErrorBoundary } from "@dennation/typebook/react";

<ErrorBoundary fallback={<p>Couldn't render this example.</p>}>
  <RiskyComponent />
</ErrorBoundary>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>Props</H2>
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
