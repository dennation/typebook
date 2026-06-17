import { registerComponent } from "@dennation/typebook";
import {
	C,
	H2,
	Lead,
	P,
	PropsReference,
	propsToRows,
	Snippet,
	Tabs,
} from "@dennation/typebook/react";

const tabs = registerComponent(Tabs);

export function PageTabs() {
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
		</>
	);
}
