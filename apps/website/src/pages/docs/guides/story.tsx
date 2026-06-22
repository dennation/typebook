import {
	C,
	Callout,
	CodeBlock,
	H2,
	Lead,
	P,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageStory() {
	return (
		<>
			<Lead>
				Typebook gives you a small family of components for rendering stories
				from a single handle: <C>{"<Story>"}</C>, <C>{"<Variants>"}</C> and{" "}
				<C>{"<Matrix>"}</C>. They all read the same{" "}
				<C>getComponentMeta()</C> handle — pick the one that matches how much of
				the prop space you want to show.
			</Lead>

			<H2>The handle</H2>
			<P>
				Everything starts with a handle. <C>getComponentMeta()</C> returns a
				self-contained object; the plugin injects the component's extracted
				props into it at build time.
			</P>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { getComponentMeta } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const button = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>One variant — Story</H2>
			<P>
				<C>{"<Story>"}</C> renders a single variant inside a preview frame:{" "}
				<C>defaultProps</C> merged with whatever you pass via <C>props</C>.
			</P>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Story of={button} />
<Story of={button} props={{ size: "lg", children: "Large" }} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<P>
				See <Link to="/docs/components/story">Story</Link> for the full prop
				reference.
			</P>

			<H2>One axis — Variants</H2>
			<P>
				<C>{"<Variants>"}</C> renders a labeled grid along one prop axis,
				described by a variant config — <C>allOf()</C>, <C>values()</C> or{" "}
				<C>generate()</C>.
			</P>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { allOf } from "@dennation/typebook/react";

<Variants of={button} items={allOf(button, "size")} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<P>
				See <Link to="/docs/components/variants">Variants</Link> for the full
				prop reference.
			</P>

			<H2>Two axes — Matrix</H2>
			<P>
				<C>{"<Matrix>"}</C> renders the cross-product of two prop axes as a
				table: one axis across the columns (<C>x</C>), one or more stacked down
				the rows (<C>y</C>).
			</P>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Matrix
  of={button}
  x={allOf(button, "color")}
  y={[allOf(button, "variant")]}
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<P>
				See <Link to="/docs/components/matrix">Matrix</Link> for the full prop
				reference.
			</P>

			<Callout type="info" title="Type-safe props">
				All three are phantom-typed on the handle: required props that{" "}
				<C>defaultProps</C> doesn't cover must be supplied via <C>props</C> at
				the call site, with exactly the missing keys demanded.
			</Callout>

			<DocsFooter
				prev={{ to: "/docs/guides/theming", title: "Theming" }}
				next={{ to: "/docs/guides/playground", title: "Interactive playground" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/story")({
	component: PageStory,
});
