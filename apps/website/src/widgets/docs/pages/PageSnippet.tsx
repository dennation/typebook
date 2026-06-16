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
</Snippet>

// or reference a component declared anywhere (resolved across files):
<Snippet name="theme-demo">{ThemeDemo}</Snippet>`}
			/>
			<P>
				At build time the plugin finds every <C>{"<Snippet>"}</C>, takes the
				example's <C>function body</C> (inline literals are sliced from the
				file; references are resolved via the TypeScript checker, even across
				files), dedents it and emits a single generated map —{" "}
				<C>snippets.gen.ts</C>. Pass it to <C>TypebookProvider</C>; at runtime
				the toggle reads the source synchronously from context (no fetch) and
				renders it through <C>CodeBlock</C>.
			</P>

			<Callout type="warning" title="Function components only">
				The example must be a function component — class components aren't
				supported and raise a build error. <C>name</C> must be a static string
				and unique; duplicates throw <C>DuplicateSnippetError</C> at build time.
			</Callout>

			<H2>Props</H2>
			<PropsTable
				props={[
					{
						name: "name",
						type: "string",
						required: true,
						desc: (
							<>
								Author-chosen key in the generated <C>snippets.gen.ts</C>.
								Unique across the project.
							</>
						),
					},
					{
						name: "children",
						type: "() => ReactNode",
						required: true,
						desc: "The example as a component function — inline or a reference. Rendered live; its body is the shown source.",
					},
				]}
			/>
		</>
	);
}
