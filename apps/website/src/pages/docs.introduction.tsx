import {
	A,
	C,
	Callout,
	Cards,
	CodeBlock,
	DocCard,
	H2,
	Icon,
	Lead,
	P,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { useDocsGo } from "../widgets/docs/useDocsGo.js";

function PageIntroduction() {
	const go = useDocsGo();
	return (
		<>
			<Lead>
				@dennation/typebook is a React component documentation library. Register
				a component once — the bundler plugin extracts its prop types via the
				TypeScript Compiler API and you render stories, variant grids, matrices
				and interactive playgrounds on any page.
			</Lead>
			<P>
				It ships two things that work together: a{" "}
				<strong>storybook runtime</strong> (<C>Story</C>, <C>Variants</C>,{" "}
				<C>Matrix</C>, <C>Playground</C>, <C>Snippet</C>) driven by build-time
				prop injection, and a <strong>docs component kit</strong> (callouts,
				code blocks, tabs, steps, search palette, sidebar — everything this site
				is built from).
			</P>

			<Callout type="info" title="This site is the demo">
				Every component documented here renders the documentation you are
				reading: the sidebar is <C>DocsSidebar</C>, the ⌘K palette is{" "}
				<C>SearchPalette</C>, this note is <C>Callout</C>.
			</Callout>

			<H2>How it works</H2>
			<P>
				The <C>typebook()</C> bundler plugin scans your sources for{" "}
				<C>getComponentMeta(Component)</C> calls, resolves prop types, default
				values and JSDoc through the TypeScript Compiler API, and{" "}
				<strong>injects</strong> the result straight back into each call as the
				handle's <C>props</C>. No registry file, no context, no lookup — the
				handle the story components receive already carries everything.
			</P>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				showLineNumbers
				code={`import { allOf, getComponentMeta } from "@dennation/typebook/react";
import { Story, Variants } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const button = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});

<Story of={button} />
<Variants of={button} items={allOf(button, "size")} />`}
			/>

			<H2>Key design decisions</H2>
			<P>
				Metadata is <strong>injected at the call site</strong>, not emitted to a
				registry file — data lives where it's used, with no string-id
				indirection and no provider to wire. Type-safety comes from{" "}
				<C>getComponentMeta</C>'s generics, so <C>tsc</C> and tests pass without
				the plugin. Routing stays the <strong>consumer's responsibility</strong>
				, so the library works with any router. And the same <C>typebook()</C>{" "}
				factory is published for every bundler via{" "}
				<A href="https://unplugin.unjs.io">unplugin</A> — no bundler is
				privileged.
			</P>

			<H2>Next steps</H2>
			<Cards>
				<DocCard
					icon={<Icon.rocket size={20} />}
					title="Installation"
					desc="Add the package and wire the bundler plugin."
					onClick={() => go("installation")}
				/>
				<DocCard
					icon={<Icon.book size={20} />}
					title="Quick Start"
					desc="From getComponentMeta() to a rendered story."
					onClick={() => go("quick-start")}
				/>
			</Cards>
		</>
	);
}

export const Route = createFileRoute("/docs/introduction")({
	component: PageIntroduction,
});
