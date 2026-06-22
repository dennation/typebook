import {
	C,
	getComponentMeta,
	H2,
	Lead,
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
				<C>Tabs</C> switches between related panels of content with an
				underline-style tab bar. For tabbed <em>code</em>, prefer{" "}
				<C>CodeBlock</C>'s own <C>CodeBlock.Tab</C> children — this component is
				for arbitrary content.
			</Lead>

			<H2>Example</H2>
			<Snippet name="tabs-example">
				{() => (
					<Tabs
						tabs={[
							{
								label: "First",
								content: <p>Content of the first panel.</p>,
							},
							{
								label: "Second",
								content: (
									<p>Content of the second panel — any ReactNode works.</p>
								),
							},
						]}
					/>
				)}
			</Snippet>

			<H2>Props</H2>
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
