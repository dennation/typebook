import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Link,
	List,
	Paragraph,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PagePluginsOverview() {
	return (
		<>
			<Lead>
				<InlineCode>typebook()</InlineCode> is one bundler plugin: you point it
				at your components, it scans their TypeScript types{" "}
				<Strong>once</Strong>, and sub-plugins turn that single scan into
				whatever you need — stories, AI instructions, live snippets.
			</Lead>

			<Heading level={2}>The scan</Heading>
			<Paragraph>
				Give <InlineCode>components</InlineCode> a path, a list, or globs. Each
				file's exported React components are extracted by type into structured
				metadata (props, defaults, JSDoc) — no wrapper call needed. Every
				sub-plugin reads that one result, so a component is never parsed twice.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="vite.config.ts"
					icon={<IconBrandReact size={14} />}
					lang="ts"
				>
					{`import { typebook } from "@dennation/typebook/vite";
import { aiInstructions } from "@dennation/typebook/plugins/ai-instructions";
import { snippets } from "@dennation/typebook/plugins/snippets";

export default defineConfig({
  plugins: [
    typebook({
      components: "src/components/**/*.tsx",
      plugins: [aiInstructions(), snippets()],
    }),
    react(),
  ],
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Sub-plugins</Heading>
			<Paragraph>
				Plugins are how you opt into functionality — nothing runs unless you add
				it. There are two kinds, distinguished by what they do:
			</Paragraph>
			<List.Root>
				<List.Item>
					<Strong>Generate</Strong> plugins consume the whole scan and write
					artifacts — e.g.{" "}
					<Link href="/docs/plugins/ai-instructions">AI Instructions</Link>{" "}
					writes Markdown docs.
				</List.Item>
				<List.Item>
					<Strong>Transform</Strong> plugins rewrite a module — e.g.{" "}
					<Link href="/docs/plugins/snippets">Snippets</Link> injects an
					example's source onto <InlineCode>{"<Snippet>"}</InlineCode>.
				</List.Item>
			</List.Root>
			<Paragraph>
				<Link href="/docs/plugins/stories">Stories</Link> are a little
				different: you author them with <InlineCode>defineStories</InlineCode>,
				and the plugin injects each component's scanned props into that call.
			</Paragraph>

			<Callout type="info" title="Same factory, every bundler">
				<InlineCode>typebook()</InlineCode> is built on{" "}
				<Link href="https://unplugin.unjs.io">unplugin</Link>, so the identical
				plugin ships for Vite, Rollup, Rolldown, webpack, Rspack, esbuild and
				Farm — import it from{" "}
				<InlineCode>@dennation/typebook/&lt;bundler&gt;</InlineCode>. See{" "}
				<Link href="/docs/getting-started/installation">Installation</Link>.
			</Callout>

			<DocsFooter
				prev={{
					to: "/docs/getting-started/quick-start",
					title: "Quick Start",
				}}
				next={{ to: "/docs/plugins/stories", title: "Stories" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/plugins/overview")({
	component: PagePluginsOverview,
});
