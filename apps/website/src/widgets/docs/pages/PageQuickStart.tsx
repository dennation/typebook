import {
	A,
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";
import type { DocsGo } from "../go.js";

export function PageQuickStart({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				From a component to a documented page in three moves: register it, let
				the plugin extract its props, render its stories. This assumes the{" "}
				<A onClick={() => go("installation")}>installation</A> is done.
			</Lead>

			<H2>Register a component</H2>
			<P>
				<C>registerComponent()</C> calls can live anywhere in{" "}
				<C>{"src/**/*.tsx"}</C> — no special filename required and no id to
				assign. It returns a self-contained handle; the plugin injects the
				extracted props into it at build time.
			</P>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { registerComponent } from "@dennation/typebook";
import { Button } from "../components/Button";

const button = registerComponent(Button, {
  defaultProps: { children: "Click me" },
});`}
			/>

			<H2>Render stories</H2>
			<P>
				Pass the handle to any story component. They are type-safe: required
				props not covered by <C>defaultProps</C> must be supplied via{" "}
				<C>props</C> at the call site.
			</P>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				showLineNumbers
				code={`import { allOf } from "@dennation/typebook";
import { Matrix, Playground, Story, Variants } from "@dennation/typebook/react";

<Story of={button} />
<Variants of={button} items={allOf(button, "size")} />
<Matrix of={button} x={allOf(button, "color")} y={[allOf(button, "variant")]} />
<Playground of={button} />`}
			/>

			<Callout type="success" title="Hot reload">
				In Vite dev mode editing a component re-injects its props through normal
				module invalidation — no restart needed. Other bundlers re-inject on each
				rebuild.
			</Callout>

			<H2>What each story does</H2>
			<MDTable
				head={["Component", "Renders"]}
				rows={[
					[
						<C key="c">{"<Story>"}</C>,
						"One variant with merged defaultProps + props",
					],
					[
						<C key="c">{"<Variants>"}</C>,
						"A grid along one prop axis (allOf / values / generate)",
					],
					[
						<C key="c">{"<Matrix>"}</C>,
						"A cross-product table of an x axis and y axes",
					],
					[
						<C key="c">{"<Playground>"}</C>,
						"Live preview + editable props table",
					],
					[
						<C key="c">{"<Snippet>"}</C>,
						"Arbitrary JSX with a show-source toggle",
					],
				]}
			/>
			<P>
				Continue with <A onClick={() => go("story")}>Story</A> for the full prop
				reference of each story component.
			</P>
		</>
	);
}
