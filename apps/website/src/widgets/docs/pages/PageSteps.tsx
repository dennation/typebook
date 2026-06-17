import {
	C,
	CodeBlock,
	getComponentMeta,
	H2,
	Lead,
	P,
	PropsReference,
	propsToRows,
	Snippet,
	Step,
	Steps,
} from "@dennation/typebook/react";

const step = getComponentMeta(Step);

export function PageSteps() {
	return (
		<>
			<Lead>
				<C>Steps</C> renders a numbered procedure with a connector line. The
				counters and the line are pure CSS (counters + pseudo-elements from the
				theme layer), so the markup stays minimal.
			</Lead>

			<H2>Example</H2>
			<Snippet name="steps-example">
				{() => (
					<Steps>
						<Step title="Install the package">
							<P>
								Any content works inside a step — paragraphs, code blocks,
								callouts.
							</P>
						</Step>
						<Step title="Wire the plugin">
							<CodeBlock lang="bash" code={`pnpm add @dennation/typebook`} />
						</Step>
						<Step title="Render a story">
							<P>The connector line stops automatically at the last step.</P>
						</Step>
					</Steps>
				)}
			</Snippet>

			<H2>Props</H2>
			<P>
				<C>Steps</C> takes only <C>children</C>. Each <C>Step</C> accepts:
			</P>
			<PropsReference props={propsToRows(step.props)} />
		</>
	);
}
