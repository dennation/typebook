import {
	CodeBlock,
	Heading,
	InlineCode,
	Lead,
	Link,
	Paragraph,
	Snippet,
} from "@dennation/typebook/react";
import { IconBrandGithub } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { Palette, Rocket, Search, Zap } from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

function PageIcons() {
	return (
		<>
			<Lead>
				Typebook ships no icon component — icons are imported directly from{" "}
				<Link href="https://lucide.dev/icons/">lucide-react</Link>, with brand
				glyphs (GitHub, React, TypeScript) coming from{" "}
				<Link href="https://tabler.io/icons">@tabler/icons-react</Link>. Both
				render inline SVG that inherits the current text color via{" "}
				<InlineCode>currentColor</InlineCode>, so they are theme-aware
				automatically.
			</Lead>

			<Heading level={2}>Example</Heading>
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

			<Heading level={2}>Usage</Heading>
			<Paragraph>
				Import the glyph you need and set <InlineCode>size</InlineCode> (square,
				in px). lucide icons take <InlineCode>strokeWidth</InlineCode>; Tabler
				icons take <InlineCode>stroke</InlineCode>. Color follows the
				surrounding text.
			</Paragraph>
			<CodeBlock.Root>
				<CodeBlock.Tab lang="tsx">
					{`import { Search, ChevronRight } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";

<Search size={16} />
<ChevronRight className="text-fg-muted" />
<IconBrandGithub size={16} stroke={1.5} />`}
				</CodeBlock.Tab>
			</CodeBlock.Root>

			<Heading level={2}>Stroke width</Heading>
			<Paragraph>
				Both libraries default to a <InlineCode>2</InlineCode> px stroke, and
				that's the weight we use everywhere across the docs — sidebar, header,
				inline glyphs — so the icon set reads consistently. Override{" "}
				<InlineCode>strokeWidth</InlineCode> (lucide) or{" "}
				<InlineCode>stroke</InlineCode> (Tabler) only for large decorative
				glyphs, where a lighter <InlineCode>1.2</InlineCode>–
				<InlineCode>1.5</InlineCode> weight keeps them from feeling heavy (as on
				the <InlineCode>Zap</InlineCode> above).
			</Paragraph>

			<DocsFooter
				prev={{ to: "/docs/guides/snippet", title: "Live snippets" }}
				next={{ to: "/docs/components/story", title: "Story" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/guides/icons")({
	component: PageIcons,
});
