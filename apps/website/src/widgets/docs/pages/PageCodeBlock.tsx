import { registerComponent } from "@dennation/typebook";
import {
	C,
	Callout,
	CodeBlock,
	H2,
	H3,
	Icon,
	Lead,
	P,
	PropsReference,
	propsToRows,
} from "@dennation/typebook/react";

const codeBlock = registerComponent(CodeBlock);

export function PageCodeBlock() {
	return (
		<>
			<Lead>
				<C>CodeBlock</C> renders highlighted, copyable code: a single snippet
				with an optional filename header, or several variants as tabs.
				Highlighting is Shiki with a CSS-variables theme mapped onto the design
				tokens (<C>--syn-*</C>) — full TextMate grammars for any language, and
				the colors still follow dark mode and the accent automatically.
			</Lead>

			<H2>Single snippet</H2>
			<P>
				Add <C>file</C> for a header bar, <C>showLineNumbers</C> for a gutter,
				and <C>highlightLines</C> to call out specific lines (1-based).
			</P>
			<CodeBlock
				file="example.ts"
				icon={<Icon.ts size={14} />}
				lang="tsx"
				showLineNumbers
				highlightLines={[3]}
				code={`export function greet(name: string): string {
  // template literals are highlighted too
  return \`Hello, \${name}!\`;
}`}
			/>

			<H3>Tabs</H3>
			<P>
				Pass <C>tabs</C> instead of <C>code</C> to stack variants — the classic
				npm/pnpm/yarn switcher:
			</P>
			<CodeBlock
				tabs={[
					{
						label: "pnpm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "pnpm add @dennation/typebook",
					},
					{
						label: "npm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "npm install @dennation/typebook",
					},
				]}
			/>

			<H2>Props</H2>
			<PropsReference props={propsToRows(codeBlock.props)} />

			<Callout type="info" title="Async by design">
				Shiki and its grammars load lazily on the first render; until then the
				code shows as plain text. Common languages (tsx, bash, json) are
				preloaded with the engine, others fetch their grammar on demand.
			</Callout>
		</>
	);
}
