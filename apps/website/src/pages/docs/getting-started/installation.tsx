import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	Steps,
} from "@dennation/typebook/react";
import { IconBrandReact, IconBrandTypescript } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SquareTerminal } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageInstallation() {
	return (
		<>
			<Lead>
				Install the package and add the <InlineCode>typebook()</InlineCode>{" "}
				plugin to your bundler. That's the whole setup — the plugin injects each
				component's prop metadata directly into your{" "}
				<InlineCode>getComponentMeta()</InlineCode> calls at build time, so
				there's no registry file and no provider to wire.
			</Lead>

			<Callout type="warning" title="Requirements">
				A React 18 or 19 app and TypeScript sources — prop extraction runs on
				the TypeScript Compiler API. Vite, Rollup, Rolldown, webpack, Rspack,
				esbuild and Farm are supported.
			</Callout>

			<Heading level={2}>Install the package</Heading>
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
				<CodeBlock.Tab
					label="yarn"
					lang="bash"
					icon={<SquareTerminal size={13} />}
				>
					{`yarn add @dennation/typebook`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Wire it up</Heading>
			<Steps.Root>
				<Steps.Step title="Add the bundler plugin">
					<Paragraph>
						Import the plugin from the entry that matches your bundler —{" "}
						<InlineCode>/vite</InlineCode>, <InlineCode>/rollup</InlineCode>,{" "}
						<InlineCode>/rolldown</InlineCode>,{" "}
						<InlineCode>/webpack</InlineCode>, <InlineCode>/rspack</InlineCode>,{" "}
						<InlineCode>/esbuild</InlineCode> or <InlineCode>/farm</InlineCode>.
					</Paragraph>
					<CodeBlock.Root>
						<CodeBlock.Tab
							file="vite.config.ts"
							icon={<IconBrandTypescript size={14} />}
							lang="tsx"
						>
							{`import { typebook } from "@dennation/typebook/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [typebook(), react()],
});`}
						</CodeBlock.Tab>
					</CodeBlock.Root>
				</Steps.Step>
				<Steps.Step title="Register a component">
					<Paragraph>
						Call <InlineCode>getComponentMeta</InlineCode> with your component,
						then render its stories anywhere. The plugin injects the extracted
						prop metadata into this call at build time — no registry, no
						provider, no imports to manage.
					</Paragraph>
					<CodeBlock.Root>
						<CodeBlock.Tab
							file="src/pages/button.tsx"
							icon={<IconBrandReact size={14} />}
							lang="tsx"
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
				</Steps.Step>
				<Steps.Step title="Load the styles">
					<Paragraph>
						The storybook UI injects its CSS through{" "}
						<InlineCode>{"<Layout>"}</InlineCode>. If you render your own pages
						instead, import the shared <InlineCode>theme.css</InlineCode> tokens
						and <InlineCode>@source</InlineCode>-scan the package — see{" "}
						<Link to="/docs/guides/theming">Theming</Link>.
					</Paragraph>
				</Steps.Step>
			</Steps.Root>

			<Callout type="info">
				Injection happens in the plugin's <InlineCode>transform</InlineCode>{" "}
				hook, so plain <InlineCode>tsc</InlineCode> and tests still type-check
				without it — the handle's <InlineCode>props</InlineCode> is simply empty
				until a build runs.
			</Callout>
			<DocsFooter
				prev={{
					to: "/docs/getting-started/introduction",
					title: "Introduction",
				}}
				next={{ to: "/docs/getting-started/quick-start", title: "Quick Start" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/getting-started/installation")({
	component: PageInstallation,
});
