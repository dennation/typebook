import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	List,
	Paragraph,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageStory() {
	return (
		<>
			<Lead>
				Typebook gives you a small family of components for rendering stories
				from a single handle: <InlineCode>{"<Story>"}</InlineCode>,{" "}
				<InlineCode>{"<Variants>"}</InlineCode> and{" "}
				<InlineCode>{"<Matrix>"}</InlineCode>. They all read the same{" "}
				<InlineCode>getComponentMeta()</InlineCode> handle — pick the one that
				matches how much of the prop space you want to show.
			</Lead>

			<Heading level={2}>The handle</Heading>
			<Paragraph>
				Everything starts with a handle.{" "}
				<InlineCode>getComponentMeta()</InlineCode> returns a self-contained
				object; the plugin injects the component's extracted props into it at
				build time.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { getComponentMeta } from "@dennation/typebook/react";
import { Button } from "../components/Button";

const meta = getComponentMeta(Button, {
  defaultProps: { children: "Click me" },
});`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>One variant — Story</Heading>
			<Paragraph>
				<InlineCode>{"<Story>"}</InlineCode> renders a single variant inside a
				preview frame: <InlineCode>defaultProps</InlineCode> merged with
				whatever you pass via <InlineCode>props</InlineCode>.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Story of={meta} />
<Story of={meta} props={{ size: "lg", children: "Large" }} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				See <Link to="/docs/components/story">Story</Link> for the full prop
				reference.
			</Paragraph>

			<Heading level={2}>One axis — Variants</Heading>
			<Paragraph>
				<InlineCode>{"<Variants>"}</InlineCode> renders a labeled grid along one
				prop axis, described by a variant config —{" "}
				<InlineCode>allOf()</InlineCode>, <InlineCode>values()</InlineCode> or{" "}
				<InlineCode>generate()</InlineCode>.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { allOf } from "@dennation/typebook/react";

<Variants of={meta} items={allOf(meta, "size")} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				See <Link to="/docs/components/variants">Variants</Link> for the full
				prop reference.
			</Paragraph>

			<Heading level={2}>Two axes — Matrix</Heading>
			<Paragraph>
				<InlineCode>{"<Matrix>"}</InlineCode> renders the cross-product of two
				prop axes as a table: one axis across the columns (
				<InlineCode>x</InlineCode>), one or more stacked down the rows (
				<InlineCode>y</InlineCode>).
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Matrix
  of={meta}
  x={allOf(meta, "color")}
  y={[allOf(meta, "variant")]}
/>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				See <Link to="/docs/components/matrix">Matrix</Link> for the full prop
				reference.
			</Paragraph>

			<Heading level={2}>Shared options</Heading>
			<Paragraph>
				All three accept the same trio: <InlineCode>title</InlineCode> (a
				caption above the preview), <InlineCode>showSource</InlineCode> (a "show
				source" toggle, <Strong>on by default</Strong>) and{" "}
				<InlineCode>interactive</InlineCode> (covered below).
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Story of={meta} title="Primary" />
<Variants of={meta} items={allOf(meta, "size")} title="Sizes" showSource={false} />
<Matrix of={meta} x={allOf(meta, "color")} y={[allOf(meta, "variant")]} interactive />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Interactive props</Heading>
			<Paragraph>
				Add <InlineCode>interactive</InlineCode> and every preview becomes
				editable in place — each one owns its own state. In a grid or matrix
				every cell edits <Strong>independently</Strong>; there is no single
				panel mutating all of them at once.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Story of={meta} interactive />
<Variants of={meta} items={allOf(meta, "size")} interactive />
<Matrix of={meta} x={allOf(meta, "color")} y={[allOf(meta, "variant")]} interactive />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<List.Root>
				<List.Item>
					Each preview gets a "show controls" toggle (collapsed by default)
					revealing a props table scoped to that one instance.
				</List.Item>
				<List.Item>
					A control per prop: literal unions become selects, booleans toggles,
					strings and numbers inputs. Search across names and a toggle for
					inherited props.
				</List.Item>
				<List.Item>
					The "show source" panel is <Strong>live</Strong> — the code reflects
					the props you've edited.
				</List.Item>
			</List.Root>
			<Callout type="info" title="Where the controls come from">
				The controls are derived from the <InlineCode>PropInfo[]</InlineCode>{" "}
				the bundler plugin extracted at build time — types, optionality,
				defaults from destructuring, and JSDoc. Props that can't be edited as
				plain values (functions, complex objects) are shown read-only with their
				type.
			</Callout>

			<Callout type="info" title="Type-safe props">
				All three are phantom-typed on the handle: required props that{" "}
				<InlineCode>defaultProps</InlineCode> doesn't cover must be supplied via{" "}
				<InlineCode>props</InlineCode> at the call site, with exactly the
				missing keys demanded.
			</Callout>

			<DocsFooter
				prev={{ to: "/docs/guides/theming", title: "Theming" }}
				next={{ to: "/docs/guides/snippet", title: "Live snippets" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/story")({
	component: PageStory,
});
