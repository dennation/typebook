import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PagePluginsAiInstructions() {
	return (
		<>
			<Lead>
				<InlineCode>aiInstructions()</InlineCode> turns the component scan into
				Markdown docs for AI agents — one card per component, plus an index — so
				Claude Code, Codex and the like know your components' real APIs.
			</Lead>

			<Heading level={2}>Enable</Heading>
			<Paragraph>
				Add it to <InlineCode>typebook()</InlineCode>'s{" "}
				<InlineCode>plugins</InlineCode>. It reads the same{" "}
				<InlineCode>components</InlineCode> scan and writes files on build (and
				regenerates them on change in dev) — no separate script.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="vite.config.ts"
					icon={<IconBrandReact size={14} />}
					lang="ts"
				>
					{`import { typebook } from "@dennation/typebook/vite";
import { aiInstructions } from "@dennation/typebook/plugins/ai-instructions";

typebook({
  components: "src/components/**/*.tsx",
  plugins: [aiInstructions({ out: ".ai/components" })],
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Output</Heading>
			<Paragraph>
				Each component becomes a self-contained card — description, deprecation
				note, and a props table — plus an <InlineCode>index.md</InlineCode> that
				lists every component. Point your agent's memory (
				<InlineCode>CLAUDE.md</InlineCode>, <InlineCode>AGENTS.md</InlineCode>)
				at the index; it reads the card it needs on demand. Each card leads with
				the exact import and the component's @remarks usage notes; the index and
				full file follow the llms.txt convention (llms.txt + llms-full.txt).
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab file=".ai/components/Button.md" lang="md">
					{`## Button

Primary call-to-action button.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| \`size\` | \`"sm" | "md" | "lg"\` | \`"md"\` | – | Button size |
| \`onClick\` | \`() => void\` | – | ✔ | Fired on click |`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="info" title="Files, not runtime">
				Cards are written to disk at build time — they never enter your app
				bundle. Inherited DOM attributes are hidden by default so the agent sees
				the component's own API, not 200 passthrough props.
			</Callout>

			<Heading level={2}>Options</Heading>
			<PropsReference
				props={[
					{
						name: "out",
						type: "string | (doc) => string",
						required: false,
						desc: 'Where each card goes. A string is a directory ("{out}/{name}.md"); a function returns the full path per component (e.g. next to its source). Default ".ai/components".',
					},
					{
						name: "importFrom",
						type: "string | (doc) => string",
						required: false,
						desc: 'Module each component is imported from — prints an import line in every card (e.g. "@acme/ui"). Omit to skip it.',
					},
					{
						name: "title",
						type: "string",
						required: false,
						desc: 'H1 title of the index and full file. Default "Components".',
					},
					{
						name: "description",
						type: "string",
						required: false,
						desc: "Blockquote summary under the title (the llms.txt project summary).",
					},
					{
						name: "indexFile",
						type: "string | false",
						required: false,
						desc: "Path of the llms.txt index. Default: llms.txt inside out. false to skip it.",
					},
					{
						name: "fullFile",
						type: "string | false",
						required: false,
						desc: "Path of the concatenated llms-full.txt. Default: inside out. false to skip it.",
					},
					{
						name: "includeInherited",
						type: "boolean",
						required: false,
						desc: "Include framework-inherited props (DOM attributes) in each card. Default false.",
					},
				]}
			/>

			<DocsFooter
				prev={{ to: "/docs/plugins/stories", title: "Stories" }}
				next={{ to: "/docs/plugins/snippets", title: "Snippets" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/plugins/ai-instructions")({
	component: PagePluginsAiInstructions,
});
