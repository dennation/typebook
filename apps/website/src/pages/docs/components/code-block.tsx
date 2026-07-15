import {
	Callout,
	CodeBlock,
	defineStories,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	propsToRows,
} from "@dennation/typebook/react";
import { IconBrandTypescript } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { SquareTerminal } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const meta = defineStories(CodeBlock.Tab);

function PageCodeBlock() {
	return (
		<>
			<Lead>
				<InlineCode>CodeBlock</InlineCode> renders highlighted, copyable code.
				It is a compound component: a <InlineCode>CodeBlock.Root</InlineCode>{" "}
				wraps one or more <InlineCode>CodeBlock.Tab</InlineCode> children. Every
				block is tabbed — a single tab just renders a one-tab bar, so there is
				one layout and no special cases. Highlighting is Shiki with the One
				Light / One Dark Pro theme pair — full TextMate grammars for any
				language, and each token ships both colors so they follow dark mode
				automatically.
			</Lead>

			<Heading level={2}>One tab</Heading>
			<Paragraph>
				A lone <InlineCode>CodeBlock.Tab</InlineCode> is the everyday case. Add{" "}
				<InlineCode>file</InlineCode> for a filename label,{" "}
				<InlineCode>showLineNumbers</InlineCode> for a gutter, and{" "}
				<InlineCode>highlightLines</InlineCode> to call out specific lines
				(1-based). The tab <InlineCode>label</InlineCode> defaults to the{" "}
				<InlineCode>file</InlineCode>, else the <InlineCode>lang</InlineCode>.
			</Paragraph>
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

			<Heading level={3}>Several tabs</Heading>
			<Paragraph>
				Add more <InlineCode>CodeBlock.Tab</InlineCode> children to stack
				variants — the classic npm/pnpm/yarn switcher:
			</Paragraph>
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

			<Heading level={2}>Tab props</Heading>
			<Paragraph>
				<InlineCode>CodeBlock.Root</InlineCode> takes only its{" "}
				<InlineCode>CodeBlock.Tab</InlineCode> children; every code option lives
				on the tab.
			</Paragraph>
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
