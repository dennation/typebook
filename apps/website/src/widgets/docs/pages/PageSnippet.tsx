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
				<C>{"<Snippet>"}</C> renders arbitrary JSX live and adds a "show source"
				toggle that reveals the exact original code — extracted at build time,
				character for character, no regeneration artifacts.
			</Lead>

			<H2>Usage</H2>
			<CodeBlock
				file="src/pages/button.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { Snippet } from "@dennation/typebook/react";

<Snippet name="button-group">
  <div className="flex gap-2">
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
  </div>
</Snippet>`}
			/>
			<P>
				At build time the plugin finds every <C>{"<Snippet>"}</C>, slices its
				children's source from the file, dedents it and emits a single generated
				map — <C>snippets.gen.ts</C>. Pass it to <C>TypebookProvider</C>; at
				runtime the toggle reads the source synchronously from context (no
				fetch) and renders it through <C>CodeBlock</C>.
			</P>

			<Callout type="warning" title="name must be static and unique">
				Only a static string <C>name</C> is extractable, and duplicates throw{" "}
				<C>DuplicateSnippetError</C> at build time.
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
						type: "ReactNode",
						required: true,
						desc: "Live content rendered above the toggle.",
					},
				]}
			/>
		</>
	);
}
