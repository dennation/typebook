import {
	C,
	Callout,
	CodeBlock,
	getComponentMeta,
	H2,
	H3,
	Lead,
	PropsReference,
	propsToRows,
} from "@dennation/typebook/react";
import { IconBrandTypescript } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { SquareTerminal } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = getComponentMeta(CodeBlock.Tab);

function PageCodeBlock() {
	return (
		<>
			<Lead>
				<C>CodeBlock</C> renders highlighted, copyable code. It is a compound
				component: a <C>CodeBlock.Root</C> wraps one or more{" "}
				<C>CodeBlock.Tab</C> children. Every block is tabbed — a single tab just
				renders a one-tab bar, so there is one layout and no special cases.
				Highlighting is Shiki with the One Light / One Dark Pro theme pair —
				full TextMate grammars for any language, and each token ships both
				colors so they follow dark mode automatically.
			</Lead>

			<H2>One tab</H2>
			<p>
				A lone <C>CodeBlock.Tab</C> is the everyday case. Add <C>file</C> for a
				filename label, <C>showLineNumbers</C> for a gutter, and{" "}
				<C>highlightLines</C> to call out specific lines (1-based). The tab{" "}
				<C>label</C> defaults to the <C>file</C>, else the <C>lang</C>.
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="example.ts"
					icon={<IconBrandTypescript size={14} />}
					lang="tsx"
					showLineNumbers
					highlightLines={[3]}
				>
					{`export function greet(name: string): string {
  // template literals are highlighted too
  return \`Hello, \${name}!\`;
}`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H3>Several tabs</H3>
			<p>
				Add more <C>CodeBlock.Tab</C> children to stack variants — the classic
				npm/pnpm/yarn switcher:
			</p>
			<CodeBlock.Root>
				<CodeBlock.Tab
					label="pnpm"
					lang="bash"
					icon={<SquareTerminal size={13} />}
				>
					{`pnpm add @dennation/typebook`}
				</CodeBlock.Tab>
				<CodeBlock.Tab
					label="npm"
					lang="bash"
					icon={<SquareTerminal size={13} />}
				>
					{`npm install @dennation/typebook`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>Tab props</H2>
			<p>
				<C>CodeBlock.Root</C> takes only its <C>CodeBlock.Tab</C> children;
				every code option lives on the tab.
			</p>
			<PropsReference props={propsToRows(meta.props)} />

			<Callout type="info" title="Async by design">
				Shiki and its grammars load lazily on the first render; until then the
				code shows as plain text. Common languages (tsx, bash, json) are
				preloaded with the engine, others fetch their grammar on demand.
			</Callout>
			<DocsFooter
				prev={{ to: "/docs/components/callout", title: "Callout" }}
				next={{ to: "/docs/components/tabs", title: "Tabs" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/code-block")({
	component: PageCodeBlock,
});
