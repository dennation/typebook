import {
	C,
	CodeBlock,
	H2,
	H3,
	ImgPlaceholder,
	Lead,
	MDTable,
} from "@dennation/typebook/react";
import { IconBrandReact } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageProse() {
	return (
		<>
			<Lead>
				The text primitives every docs page is written with: headings with
				anchor links, paragraphs, lists, quotes, links, inline code and an image
				placeholder. Base typography comes from the theme's <C>.doc-prose</C>{" "}
				layer.
			</Lead>

			<H2>Headings</H2>
			<p>
				<C>H2</C> and <C>H3</C> derive an anchor id from their text (via{" "}
				<C>slugify</C>), render a hover-revealed <C>#</C> link, and carry the{" "}
				<C>.doc-h2</C>/<C>.doc-h3</C> hooks that <C>useDocHeadings</C> collects
				for the table of contents — every heading on this page is one of them.
			</p>

			<H3>Lists</H3>
			<ul>
				<li>Unordered lists get a custom "–" marker</li>
				<li>Spacing and markers live in the theme layer</li>
			</ul>
			<ol>
				<li>Ordered lists count normally</li>
				<li>Both accept any inline content</li>
			</ol>

			<H3>Quote and rule</H3>
			<blockquote>
				Blockquotes carry an accent-tinted left border and italic text.
			</blockquote>
			<hr />

			<H3>Inline</H3>
			<p>
				Inline code like <C>useDocHeadings()</C> uses the <C>.inline-code</C>{" "}
				theme class; <a href="https://github.com/dennation/typebook">links</a>{" "}
				carry the accent color and an offset underline. <C>A</C> takes an{" "}
				<C>onClick</C> for in-app navigation instead of a hard <C>href</C>.
			</p>

			<H3>Image placeholder</H3>
			<ImgPlaceholder
				label="diagram.png — hatched placeholder while real art is pending"
				height={140}
			/>

			<H2>Usage</H2>
			<CodeBlock.Root>
				<CodeBlock.Tab
					file="page.tsx"
					icon={<IconBrandReact size={14} />}
					lang="tsx"
				>
					{`import { A, C, H2, Lead } from "@dennation/typebook/react";

// Prose is plain HTML — styled by the .doc-prose layer:
<p>Body text with <C>inline code</C> and <A onClick={() => go("tabs")}>a link</A>.</p>
<ul><li>Point one</li></ul>
<blockquote>A pull quote.</blockquote>
<hr />

// Components carry behavior or props:
<Lead>One-line summary under the page title.</Lead>
<H2>Section</H2>`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<H2>Components</H2>
			<p>
				Only elements that carry behavior or props are components. Plain prose —
				paragraphs, lists, blockquotes and rules — is written as bare HTML and
				styled by the <C>.doc-prose</C> layer, so it works the same whether you
				author it in JSX or render it from Markdown.
			</p>
			<MDTable
				head={["Component", "Renders"]}
				rows={[
					[<C key="c">H2 / H3</C>, "Anchored headings with TOC hooks"],
					[<C key="c">Lead</C>, "Large muted intro paragraph"],
					[<C key="c">C</C>, "Inline code (works outside .doc-prose too)"],
					[<C key="c">A</C>, "Accent link (href or onClick navigation)"],
					[
						<C key="c">ImgPlaceholder</C>,
						"Hatched stand-in with a label and optional height",
					],
				]}
			/>
			<MDTable
				head={["Plain tag", "Styled by"]}
				rows={[
					[<C key="c">p / ul / ol / li</C>, ".doc-prose typography"],
					[<C key="c">blockquote</C>, ".doc-prose blockquote"],
					[<C key="c">hr</C>, ".doc-prose hr"],
				]}
			/>
			<DocsFooter
				prev={{ to: "/docs/components/tables", title: "Tables" }}
				next={{ to: "/docs/components/navigation", title: "Navigation" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/prose")({
	component: PageProse,
});
