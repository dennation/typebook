import {
	A,
	C,
	CodeBlock,
	H2,
	H3,
	Hr,
	Icon,
	ImgPlaceholder,
	Lead,
	Li,
	MDTable,
	Ol,
	P,
	Quote,
	Ul,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";

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
			<P>
				<C>H2</C> and <C>H3</C> derive an anchor id from their text (via{" "}
				<C>slugify</C>), render a hover-revealed <C>#</C> link, and carry the{" "}
				<C>.doc-h2</C>/<C>.doc-h3</C> hooks that <C>useDocHeadings</C> collects
				for the table of contents — every heading on this page is one of them.
			</P>

			<H3>Lists</H3>
			<Ul>
				<Li>Unordered lists get a custom "–" marker</Li>
				<Li>Spacing and markers live in the theme layer</Li>
			</Ul>
			<Ol>
				<Li>Ordered lists count normally</Li>
				<Li>Both accept any inline content</Li>
			</Ol>

			<H3>Quote and rule</H3>
			<Quote>
				Blockquotes carry an accent-tinted left border and italic text.
			</Quote>
			<Hr />

			<H3>Inline</H3>
			<P>
				Inline code like <C>useDocHeadings()</C> uses the <C>.inline-code</C>{" "}
				theme class; <A href="https://github.com/dennation/typebook">links</A>{" "}
				carry the accent color and an offset underline. <C>A</C> takes an{" "}
				<C>onClick</C> for in-app navigation instead of a hard <C>href</C>.
			</P>

			<H3>Image placeholder</H3>
			<ImgPlaceholder
				label="diagram.png — hatched placeholder while real art is pending"
				height={140}
			/>

			<H2>Usage</H2>
			<CodeBlock
				file="page.tsx"
				icon={<Icon.react size={14} />}
				lang="tsx"
				code={`import { A, C, H2, Lead, Li, P, Quote, Ul } from "@dennation/typebook/react";

<Lead>One-line summary under the page title.</Lead>
<H2>Section</H2>
<P>Body text with <C>inline code</C> and <A onClick={() => go("tabs")}>a link</A>.</P>
<Ul><Li>Point one</Li></Ul>
<Quote>A pull quote.</Quote>`}
			/>

			<H2>Components</H2>
			<MDTable
				head={["Component", "Renders"]}
				rows={[
					[<C key="c">H2 / H3</C>, "Anchored headings with TOC hooks"],
					[<C key="c">Lead</C>, "Large muted intro paragraph"],
					[<C key="c">P / Ul / Ol / Li</C>, "Paragraphs and lists"],
					[<C key="c">C</C>, "Inline code"],
					[<C key="c">A</C>, "Accent link (href or onClick)"],
					[<C key="c">Quote / Hr</C>, "Blockquote and divider"],
					[
						<C key="c">ImgPlaceholder</C>,
						"Hatched stand-in with a label and optional height",
					],
				]}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/prose")({ component: PageProse });
