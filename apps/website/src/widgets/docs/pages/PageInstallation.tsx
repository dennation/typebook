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
import type { DocsGo } from "../go.js";

export function PageInstallation({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Install the package, add the <C>typebook()</C> plugin to your bundler,
				and wrap the app in <C>TypebookProvider</C>. The plugin generates the
				component registry; the provider serves it to the story components.
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
				<Step title="Provide the generated registry">
					<P>
						The plugin writes <C>src/ui-registry.gen.ts</C> on every build. Pass
						it to <C>TypebookProvider</C> at the root; <C>snippets</C> is
						optional and only needed once you use <C>{"<Snippet>"}</C>.
					</P>
					<CodeBlock
						file="src/App.tsx"
						icon={<Icon.react size={14} />}
						lang="tsx"
						code={`import { TypebookProvider } from "@dennation/typebook/react";
import { uiRegistry } from "./ui-registry.gen";

export default function App() {
  return (
    <TypebookProvider registry={uiRegistry}>
      {/* your router / pages */}
    </TypebookProvider>
  );
}`}
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
				A registry can also be generated without a bundler:{" "}
				<C>npx @dennation/typebook generate</C>.
			</Callout>
		</>
	);
}
