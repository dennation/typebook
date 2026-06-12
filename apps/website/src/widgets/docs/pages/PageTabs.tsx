import {
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsTable,
	Tabs,
} from "@dennation/typebook/react";

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
			<Tabs
				tabs={[
					{
						label: "First",
						content: <P>Content of the first panel.</P>,
					},
					{
						label: "Second",
						content: <P>Content of the second panel — any ReactNode works.</P>,
					},
				]}
			/>

			<H2>Usage</H2>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Tabs } from "@dennation/typebook/react";

<Tabs
  tabs={[
    { label: "First", content: <p>…</p> },
    { label: "Second", content: <p>…</p> },
  ]}
/>`}
			/>

			<H2>Props</H2>
			<PropsTable
				props={[
					{
						name: "tabs",
						type: "TabItem[]",
						required: true,
						desc: (
							<>
								Panels to switch between:{" "}
								<C>{"{ label: string, content: ReactNode }"}</C>. Labels double
								as keys, so keep them unique.
							</>
						),
					},
				]}
			/>
		</>
	);
}
