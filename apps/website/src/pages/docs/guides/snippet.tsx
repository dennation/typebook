import {
	Callout,
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Paragraph,
	PropsReference,
	Strong,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageSnippet() {
	return (
		<>
			<Lead>
				<InlineCode>{"<Snippet>"}</InlineCode> renders a component example live
				and adds a "show source" toggle that reveals the exact original code —
				extracted at build time, character for character, no regeneration
				artifacts.
			</Lead>

			<Heading level={2}>Usage</Heading>
			<Paragraph>
				The child is a <Strong>component function</Strong>, not raw JSX. The
				simplest form is an inline arrow; the shown source is its body.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Snippet } from "@dennation/typebook/react";

<Snippet name="button-group">
  {() => (
    <div className="flex gap-2">
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )}
</Snippet>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				Because the example is a component, it can use hooks — give the inline
				function a capitalized name so the rules-of-hooks lint recognises it as
				a component:
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/counter.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Snippet name="counter">
  {function Counter() {
    const [n, setN] = useState(0);
    return <Button onClick={() => setN(n + 1)}>Count: {n}</Button>;
  }}
</Snippet>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				At build time the plugin finds every{" "}
				<InlineCode>{"<Snippet>"}</InlineCode>, slices the inline function's{" "}
				<InlineCode>body</InlineCode> straight from the file, dedents it and{" "}
				<Strong>injects it back onto the element</Strong> as a{" "}
				<InlineCode>__snippetSource</InlineCode> prop. At runtime the toggle
				reads that prop directly (no context, no generated file, no fetch) and
				renders it through <InlineCode>CodeBlock</InlineCode>.
			</Paragraph>

			<Callout type="warning" title="Inline child must be a function">
				Without <InlineCode>source</InlineCode>, the child must be an{" "}
				<Strong>inline</Strong> function — a bare component reference (
				<InlineCode>{"{Counter}"}</InlineCode>) or raw JSX raises a build error,
				since its source can't be sliced from this call site. To document an
				example declared elsewhere, use <InlineCode>source</InlineCode> instead
				(below). <InlineCode>name</InlineCode> is optional; it's just a label
				shown above the source.
			</Callout>

			<Heading level={2}>
				Reference an example with <InlineCode>source</InlineCode>
			</Heading>
			<Paragraph>
				Sometimes the example already lives somewhere — a component in this file
				or imported from another. Point <InlineCode>source</InlineCode> at it
				instead of inlining. The build resolves the reference through the
				TypeScript program (following an import into another module), slices
				that function's body, and injects it as the shown source.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { Snippet } from "@dennation/typebook/react";
import { ButtonDemo } from "../demos/ButtonDemo";

// default card — preview + "show source" toggle
<Snippet source={ButtonDemo} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>
			<Paragraph>
				With <InlineCode>source</InlineCode>, <InlineCode>children</InlineCode>{" "}
				becomes an optional <Strong>layout render-prop</Strong>. It receives{" "}
				<InlineCode>{"{ preview, source, code, name }"}</InlineCode> — the live
				demo, the source already rendered as a{" "}
				<InlineCode>CodeBlock</InlineCode>, the raw source text, and the{" "}
				<InlineCode>name</InlineCode> label — so you decide where and how each
				appears. Omit <InlineCode>children</InlineCode> for the default card.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="src/pages/button.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`<Snippet source={ButtonDemo}>
  {({ preview, source }) => (
    <div className="grid grid-cols-2 gap-4">
      {preview}
      {source}
    </div>
  )}
</Snippet>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Props</Heading>
			<PropsReference
				props={[
					{
						name: "children",
						type: "(() => ReactNode) | ((slots: SnippetRenderProps) => ReactNode)",
						required: false,
						desc: "The example as an inline function component (rendered live; its body is the shown source) — or, alongside source, a layout render-prop receiving { preview, source, code, name }.",
					},
					{
						name: "source",
						type: "ComponentType",
						required: false,
						desc: "Reference to an example component declared elsewhere (this file or imported). The build slices its body as the shown source; children then acts as an optional layout render-prop.",
					},
					{
						name: "name",
						type: "string",
						required: false,
						desc: "Optional label shown as the filename above the revealed source.",
					},
				]}
			/>
			<DocsFooter
				prev={{
					to: "/docs/guides/playground",
					title: "Interactive playground",
				}}
				next={{ to: "/docs/guides/icons", title: "Icons" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/snippet")({
	component: PageSnippet,
});
