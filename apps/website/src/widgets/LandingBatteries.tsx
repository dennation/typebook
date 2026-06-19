import { Callout, CodeBlock, cx, ThemeToggle } from "@dennation/typebook/react";
import { Palette, Route, SwatchBook } from "lucide-react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";

const KIT = [
	"Callout",
	"Tabs",
	"Steps",
	"Accordion",
	"Cards",
	"PropsReference",
	"CodeBlock",
	"DocsSidebar",
	"DocsToc",
	"Breadcrumbs",
	"PrevNextNav",
	"CopyCommand",
];

const SWATCHES = ["274", "210", "150", "70", "25"];

const CARD =
	"reveal rounded-[14px] border border-border bg-bg p-5.5 flex flex-col";

/** "Batteries included" — the docs kit, theming and the menu package. */
export function LandingBatteries() {
	return (
		<section className={SECTION_PAD} id="batteries">
			<div className={CONTAINER}>
				<SectionHead
					kicker="Batteries included"
					title="Everything around the stories, too"
					sub="Typebok isn't only the storybook runtime. It ships the whole documentation surface — the kit this very site is built from."
				/>
				<div className="grid grid-cols-2 gap-5 max-[860px]:grid-cols-1">
					{/* Docs kit */}
					<div className={cx(CARD, "row-span-2")}>
						<h3 className="text-[18px] font-[640] tracking-[-0.02em] m-0 mb-2">
							A full docs component kit
						</h3>
						<p className="text-[14px] leading-[1.6] text-fg-muted m-0 mb-4">
							Callouts, tabs, steps, cards, props tables and the nav chrome —
							ready to import, styled by the same tokens.
						</p>
						<div className="mb-4">
							<Callout type="info" title="This site is the demo">
								The sidebar, this very callout and the code blocks are all the
								exported kit.
							</Callout>
						</div>
						<div className="mt-auto flex flex-wrap gap-1.5">
							{KIT.map((k) => (
								<span
									key={k}
									className="font-mono text-[11.5px] px-2 py-1 rounded-md border border-border bg-bg-secondary text-fg-muted"
								>
									{k}
								</span>
							))}
						</div>
					</div>

					{/* Theme-aware code */}
					<div className={CARD}>
						<div className="flex items-start justify-between gap-3 mb-2">
							<h3 className="text-[18px] font-[640] tracking-[-0.02em] m-0">
								Theme-aware syntax highlighting
							</h3>
							<ThemeToggle />
						</div>
						<p className="text-[14px] leading-[1.6] text-fg-muted m-0 mb-4">
							Shiki tokenizes once with the One Light / One Dark Pro pair — each
							token carries both colors, so highlighting follows the theme with
							no re-render. Try the toggle.
						</p>
						<div className="mt-auto text-[12px] [&_pre]:!m-0">
							<CodeBlock
								lang="ts"
								code={`const accent = oklch(0.55, 0.2, hue);
export const theme = { accent };`}
							/>
						</div>
					</div>

					{/* Theming tokens */}
					<div className={CARD}>
						<div className="flex items-center gap-2.5 mb-2">
							<span className="text-accent">
								<Palette size={18} />
							</span>
							<h3 className="text-[18px] font-[640] tracking-[-0.02em] m-0">
								Themeable to the token
							</h3>
						</div>
						<p className="text-[14px] leading-[1.6] text-fg-muted m-0 mb-4">
							Every color, radius and font is an OKLCH CSS variable. Recolor the
							whole system by changing one hue.
						</p>
						<div className="mt-auto flex items-center gap-2">
							{SWATCHES.map((h) => (
								<span
									key={h}
									className="w-9 h-9 rounded-[10px] border border-border"
									style={{ background: `oklch(0.62 0.17 ${h})` }}
								/>
							))}
							<span className="ml-1 inline-flex items-center gap-1.5 text-fg-subtle">
								<SwatchBook size={16} />
							</span>
						</div>
					</div>
				</div>

				{/* Router-agnostic menu strip */}
				<div className="reveal mt-5 rounded-[14px] border border-border bg-bg-secondary px-6 py-5 flex items-center gap-4 max-[620px]:flex-col max-[620px]:text-center">
					<span className="w-11 h-11 rounded-[12px] grid place-items-center bg-accent-soft text-accent border border-accent-soft-border shrink-0">
						<Route size={20} />
					</span>
					<div className="flex-1">
						<h3 className="text-[16px] font-[640] tracking-[-0.02em] m-0 mb-1">
							A router-agnostic navigation menu
						</h3>
						<p className="text-[13.5px] leading-[1.55] text-fg-muted m-0">
							<code className="font-mono text-fg">@dennation/menu</code> turns a
							keyed object — or a TanStack route tree — into a typed, nestable
							menu. Type-checked{" "}
							<code className="font-mono text-fg">parent</code> references,
							headless rendering, works with any router.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
