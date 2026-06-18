import {
	A,
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	Step,
	Steps,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { useDocsGo } from "../widgets/docs/useDocsGo";

function PageInstallation() {
	const go = useDocsGo();
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
			<CodeBlock
				tabs={[
					{
						label: "pnpm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "pnpm add @dennation/typebook",
					},
					{
						label: "npm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "npm install @dennation/typebook",
					},
					{
						label: "yarn",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "yarn add @dennation/typebook",
					},
				]}
			/>

			<H2>Wire it up</H2>
			<Steps>
				<Step title="Add the bundler plugin">
					<P>
						Import the plugin from the entry that matches your bundler —{" "}
						<C>/vite</C>, <C>/rollup</C>, <C>/rolldown</C>, <C>/webpack</C>,{" "}
						<C>/rspack</C>, <C>/esbuild</C> or <C>/farm</C>.
					</P>
					<CodeBlock
						file="vite.config.ts"
						icon={<Icon.ts size={14} />}
						lang="tsx"
						code={`import { typebook } from "@dennation/typebook/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [typebook(), react()],
});`}
					/>
				</Step>
				<Step title="Register a component">
					<P>
						Call <C>getComponentMeta</C> with your component, then render its
						stories anywhere. The plugin injects the extracted prop metadata
						into this call at build time — no registry, no provider, no imports
						to manage.
					</P>
					<CodeBlock
						file="src/pages/button.tsx"
						icon={<Icon.react size={14} />}
						lang="tsx"
						code={`import { allOf, getComponentMeta } from "@dennation/typebook/react";
import { Story, Variants } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const button = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});

<Story of={button} />
<Variants of={button} items={allOf(button, "size")} />`}
					/>
				</Step>
				<Step title="Load the styles">
					<P>
						The storybook UI injects its CSS through <C>{"<Layout>"}</C>. If you
						render your own pages instead, import the shared <C>theme.css</C>{" "}
						tokens and <C>@source</C>-scan the package — see{" "}
						<A onClick={() => go("theming")}>Theming</A>.
					</P>
				</Step>
			</Steps>

			<Callout type="info">
				Injection happens in the plugin's <C>transform</C> hook, so plain{" "}
				<C>tsc</C> and tests still type-check without it — the handle's{" "}
				<C>props</C> is simply empty until a build runs.
			</Callout>
		</>
	);
}

export const Route = createFileRoute("/docs/installation")({
	component: PageInstallation,
});
