import {
	C,
	Callout,
	CodeBlock,
	H2,
	H3,
	Icon,
	Lead,
	P,
	PropsTable,
} from "@dennation/typebook/react";

export function PageCodeBlock() {
	return (
		<>
			<Lead>
				<C>CodeBlock</C> renders highlighted, copyable code: a single snippet
				with an optional filename header, or several variants as tabs.
				Highlighting is a lightweight built-in tokenizer (tsx/bash/json) driven
				by the theme's <C>--syn-*</C> tokens — it follows dark mode and the
				accent automatically.
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
			<PropsTable
				props={[
					{
						name: "code",
						type: "string",
						desc: (
							<>
								The snippet source (single-snippet form; ignored when{" "}
								<C>tabs</C> is set).
							</>
						),
					},
					{
						name: "lang",
						type: '"tsx" | "bash" | "json" | string',
						default: '"tsx"',
						desc: "Highlighting language. Unknown values fall back to the tsx tokenizer.",
					},
					{
						name: "file",
						type: "string",
						desc: "Filename shown in the header bar (single-snippet form).",
					},
					{
						name: "icon",
						type: "ReactNode",
						desc: "Small icon rendered next to the filename.",
					},
					{
						name: "tabs",
						type: "CodeTab[]",
						desc: (
							<>
								Tabbed variants: <C>{"{ label, code, lang?, file?, icon? }"}</C>
								.
							</>
						),
					},
					{
						name: "showLineNumbers",
						type: "boolean",
						desc: "Render a line-number gutter.",
					},
					{
						name: "highlightLines",
						type: "number[]",
						default: "[]",
						desc: "1-based line numbers to tint with the accent color.",
					},
				]}
			/>

			<Callout type="info" title="Need full-grammar highlighting?">
				The storybook runtime ships <C>SourceCode</C> — a Shiki-based display
				used by <C>Snippet</C> for extracted sources. <C>CodeBlock</C> trades
				grammar coverage for zero async loading and token-driven colors.
			</Callout>
		</>
	);
}
