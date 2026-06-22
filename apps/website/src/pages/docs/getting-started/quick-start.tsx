import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	MDTable,
	Paragraph,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageQuickStart() {
	return (
		<>
			<Lead>
				From a component to a documented page in three moves: register it, let
				the plugin extract its props, render its stories. This assumes the{" "}
				<Link to="/docs/getting-started/installation">installation</Link> is
				done.
			</Lead>

			<Heading level={2}>Register a component</Heading>
			<Paragraph>
				<InlineCode>getComponentMeta()</InlineCode> calls can live anywhere in{" "}
				<InlineCode>{"src/**/*.tsx"}</InlineCode> — no special filename required
				and no id to assign. It returns a self-contained handle; the plugin
				injects the extracted props into it at build time.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { getComponentMeta } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const meta = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Render stories</Heading>
			<Paragraph>
				Pass the handle to any story component. They are type-safe: required
				props not covered by <InlineCode>defaultProps</InlineCode> must be
				supplied via <InlineCode>props</InlineCode> at the call site.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
					showLineNumbers
				>
					{`import { allOf } from "@dennation/typebook/react";
import { Matrix, Story, Variants } from "@dennation/typebook/react";

<Story of={meta} />
<Variants of={meta} items={allOf(meta, "size")} />
<Matrix of={meta} x={allOf(meta, "color")} y={[allOf(meta, "variant")]} />

// add \`interactive\` to edit any preview's props in place
<Story of={meta} interactive />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Callout type="success" title="Hot reload">
				In Vite dev mode editing a component re-injects its props through normal
				module invalidation — no restart needed. Other bundlers re-inject on
				each rebuild.
			</Callout>

			<Heading level={2}>What each story does</Heading>
			<MDTable
				head={["Component", "Renders"]}
				rows={[
					[
						<InlineCode key="c">{"<Story>"}</InlineCode>,
						"One variant with merged defaultProps + props",
					],
					[
						<InlineCode key="c">{"<Variants>"}</InlineCode>,
						"A grid along one prop axis (allOf / values / generate)",
					],
					[
						<InlineCode key="c">{"<Matrix>"}</InlineCode>,
						"A cross-product table of an x axis and y axes",
					],
					[
						<InlineCode key="c">{"<Snippet>"}</InlineCode>,
						"Arbitrary JSX with a show-source toggle",
					],
				]}
			/>
			<Paragraph>
				Continue with <Link to="/docs/guides/story">Rendering stories</Link> for
				the full prop reference of each story component.
			</Paragraph>
			<DocsFooter
				prev={{
					to: "/docs/getting-started/installation",
					title: "Installation",
				}}
				next={{ to: "/docs/guides/theming", title: "Theming" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/getting-started/quick-start")({
	component: PageQuickStart,
});
