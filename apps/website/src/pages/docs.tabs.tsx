import {
	C,
	getComponentMeta,
	H2,
	Lead,
	P,
	PropsReference,
	propsToRows,
	Snippet,
	Tabs,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../widgets/docs/DocsFooter";

const tabs = getComponentMeta(Tabs);

function PageTabs() {
	return (
		<>
			<Lead>
				<C>Tabs</C> switches between related panels of content with an
				underline-style tab bar. For tabbed <em>code</em>, prefer{" "}
				<C>CodeBlock</C>'s own <C>tabs</C> prop — this component is for
				arbitrary content.
			</Lead>

			<H2>Example</H2>
			<Snippet name="tabs-example">
				{() => (
					<Tabs
						tabs={[
							{
								label: "First",
								content: <P>Content of the first panel.</P>,
							},
							{
								label: "Second",
								content: (
									<P>Content of the second panel — any ReactNode works.</P>
								),
							},
						]}
					/>
				)}
			</Snippet>

			<H2>Props</H2>
			<PropsReference props={propsToRows(tabs.props)} />
			<DocsFooter
				prev={{ to: "/docs/code-block", title: "CodeBlock" }}
				next={{ to: "/docs/steps", title: "Steps" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/tabs")({ component: PageTabs });
