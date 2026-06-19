import {
	C,
	CodeBlock,
	H2,
	Icon,
	Lead,
	P,
	PropsReference,
	Snippet,
} from "@dennation/typebook/react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsFooter } from "../../../widgets/docs/DocsFooter";

const NAMES = [
	"search",
	"sun",
	"moon",
	"github",
	"menu",
	"chevR",
	"chevD",
	"chevL",
	"copy",
	"check",
	"hash",
	"rocket",
	"book",
	"box",
	"cog",
	"palette",
	"info",
	"warn",
	"danger",
	"ok",
	"link",
	"edit",
	"doc",
	"terminal",
	"react",
	"ts",
	"cmd",
	"arrowUpDown",
	"enter",
	"layers",
	"zap",
	"type",
] as const;

function PageIcon() {
	return (
		<>
			<Lead>
				<C>Icon</C> is a namespace of lightweight stroke icons (lucide-style
				geometry, original paths). Each entry — <C>Icon.search</C>,{" "}
				<C>Icon.moon</C>, … — is a component that inherits the current text
				color via <C>currentColor</C>.
			</Lead>

			<H2>Example</H2>
			<Snippet name="icon-example">
				{() => (
					<div className="flex items-center gap-4 text-fg">
						<Icon.rocket size={24} />
						<Icon.search size={24} />
						<Icon.github size={24} />
						<Icon.palette size={24} />
						<Icon.zap size={24} sw={1.2} />
					</div>
				)}
			</Snippet>

			<H2>Usage</H2>
			<P>
				Reference an icon by name and set <C>size</C> (square, in px). Color
				follows the surrounding text, so it is theme-aware automatically.
			</P>
			<CodeBlock
				lang="tsx"
				code={`import { Icon } from "@dennation/typebook/react";

<Icon.search size={16} />
<Icon.chevR className="text-fg-muted" />`}
			/>

			<H2>Available icons</H2>
			<P>
				The <C>IconName</C> type is the union of these keys:
			</P>
			<div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
				{NAMES.map((name) => {
					const Glyph = Icon[name as keyof typeof Icon];
					return (
						<span
							key={name}
							className="flex items-center gap-2.5 text-[13px] text-fg-muted"
						>
							<Glyph size={16} />
							<C>{name}</C>
						</span>
					);
				})}
			</div>

			<H2>Props</H2>
			<PropsReference
				props={[
					{
						name: "size",
						type: "number",
						default: "16",
						desc: "Square size in px (sets both width and height).",
					},
					{
						name: "sw",
						type: "number",
						default: "1.8",
						desc: "Stroke width.",
					},
					{
						name: "…rest",
						type: "SVGProps<SVGSVGElement>",
						desc: "Any SVG attribute (className, style, onClick, …).",
					},
				]}
			/>
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
