import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsTable,
} from "@dennation/typebook/react";

export function PageRegister() {
	return (
		<>
			<Lead>
				<C>register(id, Component, config?)</C> registers a component for
				documentation and returns a typed <C>ComponentHandle</C> that the story
				components consume. The bundler plugin finds these calls statically and
				extracts prop metadata at build time.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { register } from "@dennation/typebook";
import { Button } from "../components/Button";

const button = register("button", Button, {
  defaultProps: { children: "Click me" },
});`}
			/>

			<H2>Arguments</H2>
			<PropsTable
				props={[
					{
						name: "id",
						type: "string",
						required: true,
						desc: "Unique, human-readable key in the generated registry. Duplicates throw DuplicateRegistrationError at build time.",
					},
					{
						name: "component",
						type: "ComponentType",
						required: true,
						desc: "The React component to document.",
					},
					{
						name: "config.defaultProps",
						type: "Partial<Props>",
						desc: "Defaults merged into every story; also seeds the Playground controls.",
					},
					{
						name: "config.pick / config.omit",
						type: "(keyof Props)[]",
						desc: "Whitelist or blacklist of props to include in the documentation.",
					},
				]}
			/>

			<Callout type="info" title="Type-level bookkeeping">
				The returned handle tracks which required props are already covered by{" "}
				<C>defaultProps</C> — that's how <C>{"<Story>"}</C> can demand the
				missing ones via its <C>props</C> at compile time.
			</Callout>

			<H2>Where to call it</H2>
			<P>
				Anywhere in <C>{"src/**/*.{ts,tsx}"}</C> (configurable via the plugin's
				tsconfig lookup). The call must be a literal — the scanner reads the oxc
				AST, it doesn't execute your code.
			</P>
		</>
	);
}
