import {
	C,
	Callout,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
} from "@dennation/typebook/react";

export function PageSnippet() {
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
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Snippet } from "@dennation/typebook/react";

<Snippet name="button-group">
  {() => (
    <div className="flex gap-2">
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )}
</Snippet>`}
			/>
			<P>
				Because the example is a component, it can use hooks — give the inline
				function a capitalized name so the rules-of-hooks lint recognises it as
				a component:
			</P>
			<CodeBlock
				file="src/pages/counter.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`<Snippet name="counter">
  {function Counter() {
    const [n, setN] = useState(0);
    return <Button onClick={() => setN(n + 1)}>Count: {n}</Button>;
  }}
</Snippet>`}
			/>
			<P>
				At build time the plugin finds every <C>{"<Snippet>"}</C>, slices the
				inline function's <C>body</C> straight from the file, dedents it and{" "}
				<strong>injects it back onto the element</strong> as a{" "}
				<C>__snippetSource</C> prop. At runtime the toggle reads that prop
				directly (no context, no generated file, no fetch) and renders it
				through <C>CodeBlock</C>.
			</P>

			<Callout type="warning" title="Inline functions only">
				The child must be an <strong>inline</strong> function — a bare component
				reference (<C>{"{Counter}"}</C>) or raw JSX raises a build error, since
				its source can't be sliced from this call site. <C>name</C> is optional;
				it's just a label shown above the source.
			</Callout>

			<H2>Props</H2>
			<PropsReference
				props={[
					{
						name: "children",
						type: "() => ReactNode",
						required: true,
						desc: "The example as an inline function component. Rendered live; its body is the shown source.",
					},
					{
						name: "name",
						type: "string",
						required: false,
						desc: "Optional label shown as the filename above the revealed source.",
					},
				]}
			/>
		</>
	);
}
