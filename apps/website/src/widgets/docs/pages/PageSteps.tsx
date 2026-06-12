import {
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsTable,
	Step,
	Steps,
} from "@dennation/typebook/react";

export function PageSteps() {
	return (
		<>
			<Lead>
				<C>Steps</C> renders a numbered procedure with a connector line. The
				counters and the line are pure CSS (counters + pseudo-elements from the
				theme layer), so the markup stays minimal.
			</Lead>

			<H2>Example</H2>
			<Steps>
				<Step title="Install the package">
					<P>
						Any content works inside a step — paragraphs, code blocks, callouts.
					</P>
				</Step>
				<Step title="Wire the plugin">
					<CodeBlock lang="bash" code={`pnpm add @dennation/typebook`} />
				</Step>
				<Step title="Render a story">
					<P>The connector line stops automatically at the last step.</P>
				</Step>
			</Steps>

			<H2>Usage</H2>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Step, Steps } from "@dennation/typebook/react";

<Steps>
  <Step title="Install">…</Step>
  <Step title="Configure">…</Step>
</Steps>`}
			/>

			<H2>Props</H2>
			<P>
				<C>Steps</C> takes only <C>children</C>. Each <C>Step</C> accepts:
			</P>
			<PropsTable
				props={[
					{
						name: "title",
						type: "string",
						desc: "Optional bold heading next to the step number.",
					},
					{
						name: "children",
						type: "ReactNode",
						desc: "Step body; consecutive blocks get vertical rhythm automatically.",
					},
				]}
			/>
		</>
	);
}
