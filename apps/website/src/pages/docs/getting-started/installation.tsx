import {
	C,
	Callout,
	CodeBlock,
	H2,
	Lead,
	P,
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
				Install the package and add the <C>typebook()</C> plugin to your
				bundler. That's the whole setup — the plugin injects each component's
				prop metadata directly into your <C>getComponentMeta()</C> calls at
				build time, so there's no registry file and no provider to wire.
			</Lead>

			<Callout type="warning" title="Requirements">
				A React 18 or 19 app and TypeScript sources — prop extraction runs on
				the TypeScript Compiler API. Vite, Rollup, Rolldown, webpack, Rspack,
				esbuild and Farm are supported.
			</Callout>

			<H2>Install the package</H2>
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

			<H2>Wire it up</H2>
			<Steps.Root>
				<Steps.Step title="Add the bundler plugin">
					<P>
						Import the plugin from the entry that matches your bundler —{" "}
						<C>/vite</C>, <C>/rollup</C>, <C>/rolldown</C>, <C>/webpack</C>,{" "}
						<C>/rspack</C>, <C>/esbuild</C> or <C>/farm</C>.
					</P>
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
					<P>
						Call <C>getComponentMeta</C> with your component, then render its
						stories anywhere. The plugin injects the extracted prop metadata
						into this call at build time — no registry, no provider, no imports
						to manage.
					</P>
					<CodeBlock.Root>
						<CodeBlock.Tab
							file="src/pages/button.tsx"
							icon={<IconBrandReact size={14} />}
							lang="tsx"
						>
							{`import { allOf, getComponentMeta } from "@dennation/typebook/react";
import { Story, Variants } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const button = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});

<Story of={button} />
<Variants of={button} items={allOf(button, "size")} />`}
						</CodeBlock.Tab>
					</CodeBlock.Root>
				</Steps.Step>
				<Steps.Step title="Load the styles">
					<P>
						The storybook UI injects its CSS through <C>{"<Layout>"}</C>. If you
						render your own pages instead, import the shared <C>theme.css</C>{" "}
						tokens and <C>@source</C>-scan the package — see{" "}
						<Link to="/docs/guides/theming">Theming</Link>.
					</P>
				</Steps.Step>
			</Steps.Root>

			<Callout type="info">
				Injection happens in the plugin's <C>transform</C> hook, so plain{" "}
				<C>tsc</C> and tests still type-check without it — the handle's{" "}
				<C>props</C> is simply empty until a build runs.
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
