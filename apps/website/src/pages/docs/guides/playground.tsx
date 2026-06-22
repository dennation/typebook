import {
	C,
	Callout,
	CodeBlock,
	H2,
	Lead,
	PropsReference,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PagePlayground() {
	return (
		<>
			<Lead>
				<C>{"<Playground>"}</C> is the interactive story: a live preview on top,
				an editable props table below. Controls are derived from the extracted
				TypeScript types — no manual arg configuration.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Playground } from "@dennation/typebook/react";

<Playground of={meta} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>What the table gives you</H2>
			<ul>
				<li>
					A control per prop: literal unions become selects, booleans toggles,
					strings and numbers inputs
				</li>
				<li>Search across prop names and a toggle for inherited props</li>
				<li>
					Required props are marked; defaults and JSDoc descriptions come from
					the registry
				</li>
			</ul>

			<Callout type="info" title="Where the metadata comes from">
				The table is driven by <C>PropInfo[]</C> that the bundler plugin
				extracted at build time — types, optionality, default values from
				destructuring, and JSDoc comments.
			</Callout>

			<H2>Props</H2>
			<PropsReference
				props={[
					{
						name: "of",
						type: "ComponentMeta",
						required: true,
						desc: (
							<>
								The handle returned by <C>getComponentMeta()</C>. Initial
								control values come from its <C>defaultProps</C>.
							</>
						),
					},
				]}
			/>
			<p>
				Props that can't be edited as plain values (functions, nodes, complex
				objects) are shown read-only with their type.
			</p>
			<DocsFooter
				prev={{ to: "/docs/guides/story", title: "Rendering stories" }}
				next={{ to: "/docs/guides/snippet", title: "Live snippets" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/playground")({
	component: PagePlayground,
});
