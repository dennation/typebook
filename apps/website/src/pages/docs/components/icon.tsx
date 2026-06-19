import { C, CodeBlock, H2, Lead, P, Snippet } from "@dennation/typebook/react";
import {
	IconBrandGithub,
	IconBrandReact,
	IconBrandTypescript,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import {
	Box,
	ChevronRight,
	Copy,
	Hash,
	Layers,
	Moon,
	Palette,
	Rocket,
	Search,
	Settings,
	SquareTerminal,
	Zap,
} from "lucide-react";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const SAMPLE = [
	["Search", Search],
	["Rocket", Rocket],
	["Palette", Palette],
	["Zap", Zap],
	["Moon", Moon],
	["ChevronRight", ChevronRight],
	["Hash", Hash],
	["Box", Box],
	["Layers", Layers],
	["SquareTerminal", SquareTerminal],
	["Settings", Settings],
	["Copy", Copy],
	["IconBrandGithub", IconBrandGithub],
	["IconBrandReact", IconBrandReact],
	["IconBrandTypescript", IconBrandTypescript],
] as const;

function PageIcon() {
	return (
		<>
			<Lead>
				Typebook ships no icon component — icons are imported directly from{" "}
				<C>lucide-react</C>, with brand glyphs (GitHub, React, TypeScript)
				coming from <C>@tabler/icons-react</C>. Both render inline SVG that
				inherits the current text color via <C>currentColor</C>, so they are
				theme-aware automatically.
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

			<H2>Sample glyphs</H2>
			<div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
				{SAMPLE.map(([name, Glyph]) => (
					<span
						key={name}
						className="flex items-center gap-2.5 text-[13px] text-fg-muted"
					>
						<Glyph size={16} />
						<C>{name}</C>
					</span>
				))}
			</div>

			<DocsFooter
				prev={{ to: "/docs/components/button", title: "Button" }}
				next={{ to: "/docs/components/theme-toggle", title: "ThemeToggle" }}
			/>
		</>
	);
}

export const Route = createFileRoute("/docs/components/icon")({
	component: PageIcon,
});
