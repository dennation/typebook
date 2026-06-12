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
						type: "string",
						default: '"tsx"',
						desc: "Any Shiki language id (tsx, css, yaml, python, …). Grammars load on demand; unknown ids fall back to plain text.",
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

			<Callout type="info" title="Async by design">
				Shiki and its grammars load lazily on the first render; until then the
				code shows as plain text. Common languages (tsx, bash, json) are
				preloaded with the engine, others fetch their grammar on demand.
			</Callout>
		</>
	);
}
