import { A, C, CodeBlock, H2, Lead, P, Snippet } from "@dennation/typebook/react";
import { IconBrandGithub } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { Palette, Rocket, Search, Zap } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageIcons() {
	return (
		<>
			<Lead>
				Typebook ships no icon component — icons are imported directly from{" "}
				<A href="https://lucide.dev/icons/">lucide-react</A>, with brand glyphs
				(GitHub, React, TypeScript) coming from{" "}
				<A href="https://tabler.io/icons">@tabler/icons-react</A>. Both render
				inline SVG that inherits the current text color via <C>currentColor</C>,
				so they are theme-aware automatically.
			</Lead>

			<H2>Example</H2>
			<Snippet name="icon-example">
				{() => (
					<div className="flex items-center gap-4 text-fg">
						<Rocket size={24} />
						<Search size={24} />
						<IconBrandGithub size={24} />
						<Palette size={24} />
						<Zap size={24} strokeWidth={1.2} />
					</div>
				)}
			</Snippet>

			<H2>Usage</H2>
			<P>
				Import the glyph you need and set <C>size</C> (square, in px). lucide
				icons take <C>strokeWidth</C>; Tabler icons take <C>stroke</C>. Color
				follows the surrounding text.
			</P>
			<CodeBlock
				lang="tsx"
				code={`import { Search, ChevronRight } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";

<Search size={16} />
<ChevronRight className="text-fg-muted" />
<IconBrandGithub size={16} stroke={1.5} />`}
			/>

			<H2>Stroke width</H2>
			<P>
				Both libraries default to a <C>2</C> px stroke, and that's the weight we
				use everywhere across the docs — sidebar, header, inline glyphs — so the
				icon set reads consistently. Override <C>strokeWidth</C> (lucide) or{" "}
				<C>stroke</C> (Tabler) only for large decorative glyphs, where a lighter{" "}
				<C>1.2</C>–<C>1.5</C> weight keeps them from feeling heavy (as on the{" "}
				<C>Zap</C> above).
			</P>

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
