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

function PageInteractive() {
	return (
		<>
			<Lead>
				Playing with props is a <InlineCode>interactive</InlineCode> prop on the
				story components, not a separate widget. Add it to{" "}
				<InlineCode>{"<Story>"}</InlineCode>,{" "}
				<InlineCode>{"<Variants>"}</InlineCode> or{" "}
				<InlineCode>{"<Matrix>"}</InlineCode> and every preview becomes editable
				in place — each one owns its own state.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { allOf, Matrix, Story, Variants } from "@dennation/typebook/react";

// one editable preview
<Story of={meta} interactive />

// every cell independently editable
<Variants of={meta} items={allOf(meta, "size")} interactive />
<Matrix of={meta} x={allOf(meta, "color")} y={[allOf(meta, "variant")]} interactive />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>How it behaves</Heading>
			<List.Root>
				<List.Item>
					Each preview gets a <Strong>"show controls"</Strong> toggle (collapsed
					by default) revealing a props table scoped to that one instance.
				</List.Item>
				<List.Item>
					A control per prop: literal unions become selects, booleans toggles,
					strings and numbers inputs. Search across names and a toggle for
					inherited props.
				</List.Item>
				<List.Item>
					In a grid or matrix, every cell edits <Strong>independently</Strong> —
					there is no single panel mutating all of them at once.
				</List.Item>
				<List.Item>
					The "show source" panel is <Strong>live</Strong>: the code reflects
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

			<Heading level={2}>Related props</Heading>
			<Paragraph>
				<InlineCode>interactive</InlineCode> pairs with the other shared story
				props — <InlineCode>title</InlineCode> (a caption above the preview) and{" "}
				<InlineCode>showSource</InlineCode> (on by default). See{" "}
				<Link to="/docs/guides/story">Rendering stories</Link> for the full set.
			</Paragraph>
			<DocsFooter
				prev={{ to: "/docs/guides/story", title: "Rendering stories" }}
				next={{ to: "/docs/guides/snippet", title: "Live snippets" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/interactive")({
	component: PageInteractive,
});
