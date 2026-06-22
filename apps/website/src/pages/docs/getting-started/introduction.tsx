import {
	Callout,
	Cards,
	CodeBlock,
	DocCard,
	Heading,
	InlineCode,
	Lead,
	Link,
	Paragraph,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Book, Rocket } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageIntroduction() {
	const navigate = useNavigate();
	return (
		<>
			<Lead>
				@dennation/typebook is a React component documentation library. Register
				a component once — the bundler plugin extracts its prop types via the
				TypeScript Compiler API and you render stories, variant grids, matrices
				and interactive, editable previews on any page.
			</Lead>
			<Paragraph>
				It ships two things that work together: a{" "}
				<Strong>storybook runtime</Strong> (<InlineCode>Story</InlineCode>,{" "}
				<InlineCode>Variants</InlineCode>, <InlineCode>Matrix</InlineCode>,{" "}
				<InlineCode>Snippet</InlineCode> — each with an optional{" "}
				<InlineCode>interactive</InlineCode> mode) driven by build-time prop
				injection, and a <Strong>docs component kit</Strong> (callouts, code
				blocks, tabs, steps, sidebar — everything this site is built from).
			</Paragraph>

			<Callout type="info" title="This site is the demo">
				Every component documented here renders the documentation you are
				reading: the sidebar is <InlineCode>DocsSidebar</InlineCode>, this note
				is <InlineCode>Callout</InlineCode>.
			</Callout>

			<Heading level={2}>How it works</Heading>
			<Paragraph>
				The <InlineCode>typebook()</InlineCode> bundler plugin scans your
				sources for <InlineCode>getComponentMeta(Component)</InlineCode> calls,
				resolves prop types, default values and JSDoc through the TypeScript
				Compiler API, and <Strong>injects</Strong> the result straight back into
				each call as the handle's <InlineCode>props</InlineCode>. No registry
				file, no context, no lookup — the handle the story components receive
				already carries everything.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
					showLineNumbers
				>
					{`import { allOf, getComponentMeta } from "@dennation/typebook/react";
import { Story, Variants } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const meta = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});

<Story of={meta} />
<Variants of={meta} items={allOf(meta, "size")} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Key design decisions</Heading>
			<Paragraph>
				Metadata is <Strong>injected at the call site</Strong>, not emitted to a
				registry file — data lives where it's used, with no string-id
				indirection and no provider to wire. Type-safety comes from{" "}
				<InlineCode>getComponentMeta</InlineCode>'s generics, so{" "}
				<InlineCode>tsc</InlineCode> and tests pass without the plugin. Routing
				stays the <Strong>consumer's responsibility</Strong>, so the library
				works with any router. And the same <InlineCode>typebook()</InlineCode>{" "}
				factory is published for every bundler via{" "}
				<Link href="https://unplugin.unjs.io">unplugin</Link> — no bundler is
				privileged.
			</Paragraph>

			<Heading level={2}>Next steps</Heading>
			<Cards>
				<DocCard
					icon={<Rocket size={20} />}
					title="Installation"
					desc="Add the package and wire the bundler plugin."
					onClick={() => navigate({ to: "/docs/getting-started/installation" })}
				/>
				<DocCard
					icon={<Book size={20} />}
					title="Quick Start"
					desc="From getComponentMeta() to a rendered story."
					onClick={() => navigate({ to: "/docs/getting-started/quick-start" })}
				/>
			</Cards>
			<DocsFooter
				next={{
					to: "/docs/getting-started/installation",
					title: "Installation",
				}}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/getting-started/introduction")({
	component: PageIntroduction,
});
