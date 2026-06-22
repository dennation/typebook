import {
	C,
	Callout,
	CodeBlock,
	H2,
	Lead,
	P,
	PropsReference,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageSnippet() {
	return (
		<>
			<Lead>
				<C>{"<Snippet>"}</C> renders a component example live and adds a "show
				source" toggle that reveals the exact original code — extracted at build
				time, character for character, no regeneration artifacts.
			</Lead>

			<H2>Usage</H2>
			<P>
				The child is a <strong>component function</strong>, not raw JSX. The
				simplest form is an inline arrow; the shown source is its body.
			</P>
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
			<P>
				Because the example is a component, it can use hooks — give the inline
				function a capitalized name so the rules-of-hooks lint recognises it as
				a component:
			</P>
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
			<P>
				At build time the plugin finds every <C>{"<Snippet>"}</C>, slices the
				inline function's <C>body</C> straight from the file, dedents it and{" "}
				<strong>injects it back onto the element</strong> as a{" "}
				<C>__snippetSource</C> prop. At runtime the toggle reads that prop
				directly (no context, no generated file, no fetch) and renders it
				through <C>CodeBlock</C>.
			</P>

			<Callout type="warning" title="Inline child must be a function">
				Without <C>source</C>, the child must be an <strong>inline</strong>{" "}
				function — a bare component reference (<C>{"{Counter}"}</C>) or raw JSX
				raises a build error, since its source can't be sliced from this call
				site. To document an example declared elsewhere, use <C>source</C>{" "}
				instead (below). <C>name</C> is optional; it's just a label shown above
				the source.
			</Callout>

			<H2>
				Reference an example with <C>source</C>
			</H2>
			<P>
				Sometimes the example already lives somewhere — a component in this file
				or imported from another. Point <C>source</C> at it instead of inlining.
				The build resolves the reference through the TypeScript program
				(following an import into another module), slices that function's body,
				and injects it as the shown source.
			</P>
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
			<P>
				With <C>source</C>, <C>children</C> becomes an optional{" "}
				<strong>layout render-prop</strong>. It receives{" "}
				<C>{"{ preview, source, code, name }"}</C> — the live demo, the source
				already rendered as a <C>CodeBlock</C>, the raw source text, and the{" "}
				<C>name</C> label — so you decide where and how each appears. Omit{" "}
				<C>children</C> for the default card.
			</P>
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

			<H2>Props</H2>
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
