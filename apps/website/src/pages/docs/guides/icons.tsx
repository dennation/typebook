import {
	C,
	Callout,
	CodeBlock,
	H2,
	Lead,
	MDTable,
	P,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageIcons() {
	return (
		<>
			<Lead>
				Typebook ships no icon set of its own — icons are a design choice that
				belongs to your site, not the library. Instead, the docs components
				render a small set of sensible defaults and let you swap any of them for
				whatever you prefer.
			</Lead>

			<H2>Recommended libraries</H2>
			<P>
				This site, and every default icon inside the package, is built on these
				two. They are tree-shakeable, render inline SVG and inherit the current
				text color via <C>currentColor</C>, so they are theme-aware out of the
				box.
			</P>
			<MDTable
				head={["Library", "Use it for"]}
				rows={[
					[
						<C key="v">lucide-react</C>,
						"General UI icons — the primary set (search, chevrons, copy, …).",
					],
					[
						<C key="v">@tabler/icons-react</C>,
						"Brand and logo glyphs lucide does not ship (GitHub, React, TypeScript, …).",
					],
				]}
			/>
			<CodeBlock lang="bash" code="pnpm add lucide-react @tabler/icons-react" />

			<H2>Usage</H2>
			<P>
				Import the glyph you need directly and render it like any component.
				lucide icons take <C>strokeWidth</C>; Tabler icons take <C>stroke</C>.
			</P>
			<CodeBlock
				lang="tsx"
				code={`import { Search } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";

<Search size={16} />
<IconBrandGithub size={16} stroke={1.5} />`}
			/>

			<H2>Overriding the defaults</H2>
			<P>
				Every icon rendered inside a Typebook component is exposed as an
				optional <C>ReactNode</C> prop, each defaulting to its lucide glyph.
				Pass your own element to override it — from either recommended library,
				another set, or hand-written SVG.
			</P>
			<CodeBlock
				lang="tsx"
				code={`import { ArrowLeft, ArrowRight } from "lucide-react";

// swap the default chevrons for arrows
<PrevNextNav
  prev={prev}
  next={next}
  prevIcon={<ArrowLeft size={13} />}
  nextIcon={<ArrowRight size={13} />}
/>`}
			/>
			<P>
				The same applies to data props: <C>DocsSidebar</C> sections take a
				rendered <C>icon</C> element, so the section glyphs are entirely yours.
			</P>

			<Callout type="info" title="Use anything you like">
				The recommendation is just a default. Because every icon prop is a plain{" "}
				<C>ReactNode</C>, any React element works — a different icon library, an
				inline <C>{"<svg>"}</C>, an <C>{"<img>"}</C>, even an emoji.
			</Callout>
			<DocsFooter
				prev={{ to: "/docs/guides/snippet", title: "Live snippets" }}
				next={{ to: "/docs/components/callout", title: "Callout" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/icons")({
	component: PageIcons,
});
