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
				Add Typebok to a new or existing React project. The CLI scaffolds a
				working docs route; the manual path drops the pieces in yourself.
			</Lead>

			<Callout type="warning" title="Requirements">
				Typebok needs <strong>Node 18.17+</strong> and a React 18 or 19 app. It
				works with Next.js, Vite and Astro out of the box.
			</Callout>

			<H2>Install with the CLI</H2>
			<P>
				The quickest way to start. The initializer creates the content folder,
				config file and a docs route, then installs dependencies.
			</P>
			<CodeBlock
				tabs={[
					{
						label: "npm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "npx create-typebok@latest my-docs",
					},
					{
						label: "pnpm",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "pnpm create typebok my-docs",
					},
					{
						label: "yarn",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "yarn create typebok my-docs",
					},
					{
						label: "bun",
						lang: "bash",
						icon: <Icon.terminal size={13} />,
						code: "bun create typebok my-docs",
					},
				]}
			/>

			<H2>Manual installation</H2>
			<P>
				Already have an app? Install the package and add the source loader
				yourself.
			</P>
			<Steps>
				<Step title="Install the package">
					<CodeBlock
						tabs={[
							{
								label: "npm",
								lang: "bash",
								icon: <Icon.terminal size={13} />,
								code: "npm install typebok",
							},
							{
								label: "pnpm",
								lang: "bash",
								icon: <Icon.terminal size={13} />,
								code: "pnpm add typebok",
							},
							{
								label: "yarn",
								lang: "bash",
								icon: <Icon.terminal size={13} />,
								code: "yarn add typebok",
							},
						]}
					/>
				</Step>
				<Step title="Create the source loader">
					<P>
						Point the loader at the directory that holds your content files.
					</P>
					<CodeBlock
						file="lib/source.ts"
						icon={<Icon.ts size={14} />}
						lang="tsx"
						code={`import { createDocs } from "typebok";

export const source = createDocs({
  dir: "content/docs",
  baseUrl: "/docs",
});`}
					/>
				</Step>
				<Step title="Add the config file">
					<CodeBlock
						file="typebok.config.ts"
						icon={<Icon.ts size={14} />}
						lang="tsx"
						code={`import { defineConfig } from "typebok/config";

export default defineConfig({
  name: "Acme Docs",
  theme: { accent: "indigo", defaultMode: "system" },
});`}
					/>
				</Step>
				<Step title="Write your first page">
					<P>
						Create <C>content/docs/index.mdx</C> and start the dev server.
						That's it.
					</P>
					<CodeBlock
						file="content/docs/index.mdx"
						lang="bash"
						code={`---
title: Hello world
---

# Welcome

Your first **Typebok** page is live.`}
					/>
				</Step>
			</Steps>

			<Callout type="info">
				Using a monorepo or a custom bundler? See{" "}
				<A onClick={() => go("configuration")}>Configuration</A> for
				framework-specific adapters.
			</Callout>
		</>
	);
}
