import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	Li,
	P,
	PropsReference,
	Ul,
} from "@dennation/typebook/react";

export function PagePlayground() {
	return (
		<>
			<Lead>
				<C>{"<Playground>"}</C> is the interactive story: a live preview on top,
				an editable props table below. Controls are derived from the extracted
				TypeScript types — no manual arg configuration.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Playground } from "@dennation/typebook/react";

<Playground of={button} />`}
			/>

			<H2>What the table gives you</H2>
			<Ul>
				<Li>
					A control per prop: literal unions become selects, booleans toggles,
					strings and numbers inputs
				</Li>
				<Li>Search across prop names and a toggle for inherited props</Li>
				<Li>
					Required props are marked; defaults and JSDoc descriptions come from
					the registry
				</Li>
			</Ul>

			<Callout type="info" title="Where the metadata comes from">
				The table is driven by <C>PropInfo[]</C> that the bundler plugin
				extracted at build time — types, optionality, default values from
				destructuring, and JSDoc comments.
			</Callout>

			<H2>Props</H2>
			<PropsReference
				props={[
					{
						name: "of",
						type: "ComponentHandle",
						required: true,
						desc: (
							<>
								The handle returned by <C>register()</C>. Initial control values
								come from its <C>defaultProps</C>.
							</>
						),
					},
				]}
			/>
			<P>
				Props that can't be edited as plain values (functions, nodes, complex
				objects) are shown read-only with their type.
			</P>
		</>
	);
}
