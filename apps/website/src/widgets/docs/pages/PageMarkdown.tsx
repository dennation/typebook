import { Icon } from "@dennation/typebook/react";
import { CodeBlock } from "../../../features/code-block/CodeBlock.js";
import {
	A,
	C,
	Callout,
	H2,
	H3,
	Hr,
	ImgPlaceholder,
	Lead,
	Li,
	MDTable,
	Ol,
	P,
	Quote,
	Ul,
} from "../../../shared/ui/md/index.js";
import type { DocsGo } from "../go.js";

export function PageMarkdown({ go }: { go: DocsGo }) {
	return (
		<>
			<Lead>
				Typebok renders standard Markdown plus a set of MDX components. Here is
				every block element, styled with the default theme.
			</Lead>

			<H2>Text & inline</H2>
			<P>
				Paragraphs flow with comfortable measure and <strong>bold</strong>{" "}
				emphasis. Inline code like <C>useSearch()</C> stands out, and{" "}
				<A>links</A> carry the accent color. Long lines wrap with{" "}
				<C>text-wrap: pretty</C> for tidy ragged edges.
			</P>

			<H3>Unordered lists</H3>
			<Ul>
				<Li>Filesystem routing — folders map to groups</Li>
				<Li>Build-time search index, no runtime service</Li>
				<Li>Dark mode that respects system preference</Li>
			</Ul>

			<H3>Ordered lists</H3>
			<Ol>
				<Li>Install the package</Li>
				<Li>Create the source loader</Li>
				<Li>Write a page and run dev</Li>
			</Ol>

			<H2>Blockquote</H2>
			<Quote>
				Good documentation is a conversation with a reader who isn't in the
				room. Write for them, not for yourself.
			</Quote>

			<H2>Tables</H2>
			<P>Pipe tables render as responsive, bordered tables.</P>
			<MDTable
				head={["Adapter", "Framework", "Status"]}
				rows={[
					["@typebok/next", "Next.js 14+", "Stable"],
					["@typebok/vite", "Vite + React", "Stable"],
					["@typebok/astro", "Astro 4", "Beta"],
				]}
			/>

			<H2>Code blocks</H2>
			<P>
				Fenced code is highlighted and copyable. Add a filename for a header, or
				stack multiple languages as tabs.
			</P>
			<CodeBlock
				file="example.ts"
				icon={<Icon.ts size={14} />}
				lang="tsx"
				showLineNumbers
				code={`export function greet(name: string): string {
  // template literals are highlighted too
  return \`Hello, \${name}!\`;
}`}
			/>

			<H2>Callouts</H2>
			<P>Four intents communicate severity at a glance.</P>
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<Callout type="info" title="Note">
					Callouts accept a title and rich children.
				</Callout>
				<Callout type="success" title="Tip">
					Prefer one strong callout per section over many.
				</Callout>
				<Callout type="warning" title="Warning">
					This API is experimental and may change.
				</Callout>
				<Callout type="danger" title="Danger">
					Deleting the source folder cannot be undone.
				</Callout>
			</div>

			<H2>Images</H2>
			<P>Images render full-width within the content measure.</P>
			<ImgPlaceholder label="diagram.png — architecture overview" />

			<Hr />
			<P>
				See the <A onClick={() => go("callout")}>Callout</A> and{" "}
				<A onClick={() => go("code-block")}>Code Block</A> pages for full
				component APIs.
			</P>
		</>
	);
}
