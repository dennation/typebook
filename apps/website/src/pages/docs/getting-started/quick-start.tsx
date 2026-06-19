import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageQuickStart() {
	return (
		<>
			<Lead>
				From a component to a documented page in three moves: register it, let
				the plugin extract its props, render its stories. This assumes the{" "}
				<Link to="/docs/getting-started/installation">installation</Link> is
				done.
			</Lead>

			<H2>Register a component</H2>
			<P>
				<C>getComponentMeta()</C> calls can live anywhere in{" "}
				<C>{"src/**/*.tsx"}</C> — no special filename required and no id to
				assign. It returns a self-contained handle; the plugin injects the
				extracted props into it at build time.
			</P>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { getComponentMeta } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const button = getComponentMeta(Button, {
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
				code={`import { allOf } from "@dennation/typebook/react";
import { Matrix, Playground, Story, Variants } from "@dennation/typebook/react";

<Story of={button} />
<Variants of={button} items={allOf(button, "size")} />
<Matrix of={button} x={allOf(button, "color")} y={[allOf(button, "variant")]} />
<Playground of={button} />`}
			/>

			<Callout type="success" title="Hot reload">
				In Vite dev mode editing a component re-injects its props through normal
				module invalidation — no restart needed. Other bundlers re-inject on
				each rebuild.
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
				Continue with <Link to="/docs/guides/story">Rendering stories</Link> for
				the full prop reference of each story component.
			</P>
			<DocsFooter
				prev={{
					to: "/docs/getting-started/installation",
					title: "Installation",
				}}
				next={{ to: "/docs/guides/theming", title: "Theming" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/getting-started/quick-start")({
	component: PageQuickStart,
});
