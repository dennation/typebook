import {
	ARROW_CLASS,
	buttonClass,
	CopyCommand,
	cx,
} from "@dennation/typebook/react";
import {
	Box,
	ChevronRight,
	CornerDownLeft,
	Hash,
	Link2,
	Rocket,
	Search,
	TriangleAlert,
	Zap,
} from "lucide-react";
import { CONTAINER } from "../shared/lib/landingLayout";

const MINI_IT =
	"flex items-center gap-2 text-[12.5px] text-fg-muted px-2 py-1.25 rounded-md";
const DOT = "w-1 h-1 rounded-[99px] bg-current opacity-35";

const HeroBg = () => (
	<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_oklch,var(--accent)_11%,transparent),transparent_60%)]" />
);
const HeroGrid = () => (
	<div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(80%_60%_at_50%_0%,#000_0%,transparent_75%)] [-webkit-mask-image:radial-gradient(80%_60%_at_50%_0%,#000_0%,transparent_75%)]" />
);

export interface LandingHeroProps {
	/** Link target for the "Read the docs" CTA. */
	docsHref?: string;
	/** Install command shown in the copy pill. */
	command?: string;
}

/** Landing hero: headline, CTAs and the docs-site preview mockup. */
export function LandingHero({
	docsHref = "#",
	command = "npx create-typebok@latest",
}: LandingHeroProps) {
	return (
		<section
			className="relative pt-21 pb-30 overflow-hidden max-[860px]:pb-21 max-[620px]:pt-14"
			id="top"
		>
			<HeroBg />
			<HeroGrid />
			<div
				className={cx(
					CONTAINER,
					"relative z-1 flex flex-col items-center text-center",
				)}
			>
				<div className="inline-flex items-center gap-2.25 h-7.5 pl-3.25 pr-1.5 border border-border rounded-[99px] bg-[color-mix(in_oklch,var(--bg)_60%,transparent)] backdrop-blur-[6px] text-[13px] text-fg-muted mb-7.5">
					<span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[99px] bg-accent-soft text-accent border border-accent-soft-border">
						v2.4
					</span>
					<span>Instant ⌘K search is here</span>
					<span className="text-fg-subtle inline-flex">
						<ChevronRight size={13} />
					</span>
				</div>
				<h1 className="text-[clamp(40px,6.4vw,72px)] font-[680] tracking-[-0.035em] leading-[1.02] m-0 mb-5.5 max-w-[16ch] text-balance">
					Docs your readers{" "}
					<span className="bg-[linear-gradient(110deg,var(--accent),oklch(0.62_0.17_320))] bg-clip-text text-transparent">
						actually finish
					</span>
					.
				</h1>
				<p className="text-[clamp(17px,2.1vw,20px)] leading-[1.6] text-fg-muted m-0 mb-9 max-w-[56ch] text-pretty">
					Typebok is a content-first documentation framework for React. Write
					plain
					<strong className="text-fg font-semibold"> Markdown or MDX</strong> —
					ship a polished sidebar, instant search, syntax highlighting and dark
					mode with{" "}
					<strong className="text-fg font-semibold">zero config</strong>.
				</p>
				<div className="flex items-center gap-3 flex-wrap justify-center mb-5.5">
					<a className={buttonClass("primary", "lg")} href={docsHref}>
						Read the docs <ChevronRight size={16} className={ARROW_CLASS} />
					</a>
					<CopyCommand cmd={command} />
				</div>
				<div className="flex items-center gap-3.5 text-[13px] text-fg-subtle mt-1 flex-wrap justify-center">
					<span className="text-[12px] tracking-[0.03em]">Drops into</span>
					<span className="inline-flex items-center gap-1.75 text-fg-muted font-medium">
						<Box size={14} /> Next.js
					</span>
					<span className="w-0.75 h-0.75 rounded-[99px] bg-border-strong" />
					<span className="inline-flex items-center gap-1.75 text-fg-muted font-medium">
						<Zap size={14} /> Vite
					</span>
					<span className="w-0.75 h-0.75 rounded-[99px] bg-border-strong" />
					<span className="inline-flex items-center gap-1.75 text-fg-muted font-medium">
						<Rocket size={14} /> Astro
					</span>
				</div>

				<div className="relative z-1 w-full mt-16 [perspective:1800px] reveal">
					<div className="border border-border rounded-[14px] overflow-hidden bg-bg shadow-lg">
						<div className="flex items-center gap-2 h-10.5 px-3.75 bg-bg-secondary border-b border-border">
							<div className="flex gap-1.75">
								<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
								<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
								<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
							</div>
							<span className="mx-auto font-mono text-[11.5px] text-fg-subtle bg-bg border border-border rounded-[7px] px-4 py-1 inline-flex items-center gap-1.75">
								<Link2 size={11} />
								acme.dev/docs/components/callout
							</span>
						</div>
						<div className="grid grid-cols-[210px_1fr_170px] min-h-107.5 max-[1000px]:grid-cols-[180px_1fr] max-[620px]:grid-cols-1">
							<aside className="border-r border-border px-3.5 py-5 flex flex-col gap-4.5 bg-bg max-[620px]:hidden">
								<div className="flex flex-col gap-1.25">
									<div className="text-[10px] font-semibold tracking-[0.07em] uppercase text-fg-subtle px-2 mb-0.75 flex items-center gap-1.75">
										<Rocket size={12} /> Getting Started
									</div>
									<div className={MINI_IT}>
										<span className={DOT} />
										Introduction
									</div>
									<div className={MINI_IT}>
										<span className={DOT} />
										Installation
									</div>
									<div className={MINI_IT}>
										<span className={DOT} />
										Quick Start
									</div>
								</div>
								<div className="flex flex-col gap-1.25">
									<div className="text-[10px] font-semibold tracking-[0.07em] uppercase text-fg-subtle px-2 mb-0.75 flex items-center gap-1.75">
										<Box size={12} /> Components
									</div>
									<div className="flex items-center gap-2 text-[12.5px] px-2 py-1.25 rounded-md bg-accent-soft text-accent font-medium">
										<span className="w-1 h-1 rounded-[99px] bg-current" />
										Callout
									</div>
									<div className={MINI_IT}>
										<span className={DOT} />
										Code Block
									</div>
									<div className={MINI_IT}>
										<span className={DOT} />
										Tabs
									</div>
								</div>
							</aside>
							<div className="px-8.5 py-7.5 min-w-0">
								<div className="text-[11.5px] text-fg-subtle mb-4">
									<b className="text-fg-muted font-medium">Components</b> /
									Callout
								</div>
								<h2 className="text-[27px] font-[650] tracking-[-0.025em] m-0 mb-3">
									Callout
								</h2>
								<p className="text-[14px] leading-[1.6] text-fg-muted m-0 mb-5 max-w-[46ch]">
									Draw the reader's eye to notes, tips, warnings and dangers —
									the most-used MDX component in Typebok.
								</p>
								<div className="flex gap-2.75 px-3.75 py-3.25 rounded-[9px] text-[13px] leading-[1.5] border border-[color-mix(in_oklch,oklch(0.68_0.15_70)_35%,var(--border))] bg-[color-mix(in_oklch,oklch(0.68_0.15_70)_9%,var(--bg))] mt-1">
									<span className="shrink-0 mt-px [color:oklch(0.68_0.15_70)]">
										<TriangleAlert size={17} />
									</span>
									<span>
										<span className="font-semibold text-fg block mb-0.5">
											Heads up
										</span>
										<span className="text-fg-muted">
											This API is experimental and may change.
										</span>
									</span>
								</div>
							</div>
							<div className="border-l border-border pt-7.5 pl-4.5 flex flex-col gap-2.5 max-[1000px]:hidden">
								<div className="text-[10px] font-semibold tracking-[0.07em] uppercase text-fg-subtle">
									On this page
								</div>
								<div className="text-[12px] text-accent">Usage</div>
								<div className="text-[12px] text-fg-muted">Intents</div>
								<div className="text-[12px] text-fg-muted">Props</div>
								<div className="text-[12px] text-fg-muted">Recipes</div>
							</div>
						</div>
					</div>
					<div className="absolute z-3 -right-2 -bottom-8.5 w-[min(360px,76vw)] bg-bg border border-border-strong rounded-[14px] shadow-lg overflow-hidden animate-[floaty_6s_ease-in-out_infinite] motion-reduce:animate-none max-[620px]:hidden">
						<div className="flex items-center gap-2.5 px-3.75 py-3.25 border-b border-border">
							<span className="text-fg-subtle shrink-0 inline-flex">
								<Search size={16} />
							</span>
							<span className="text-[14.5px] relative whitespace-nowrap overflow-hidden">
								<span className="text-fg">callout</span>
								<span className="inline-block w-[1.5px] h-4 bg-accent align-[-3px] ml-px animate-[blink_1s_step-end_infinite] motion-reduce:animate-none" />
							</span>
							<span className="font-mono text-[11px] text-fg-muted border border-border rounded-[5px] px-1.5 py-0.5 ml-auto">
								esc
							</span>
						</div>
						<div className="p-1.75 flex flex-col gap-0.5">
							<div className="flex items-center gap-2.75 px-2.75 py-2.25 rounded-lg bg-accent-soft">
								<span className="text-accent shrink-0 inline-flex">
									<Box size={15} />
								</span>
								<span className="text-[13px] font-medium text-accent">
									Callout
								</span>
								<span className="ml-auto text-accent inline-flex">
									<CornerDownLeft size={14} />
								</span>
							</div>
							<div className="flex items-center gap-2.75 px-2.75 py-2.25 rounded-lg">
								<span className="text-fg-subtle shrink-0 inline-flex">
									<Hash size={15} />
								</span>
								<span className="text-[13px] font-medium text-fg">
									Callout props
								</span>
								<span className="text-[11px] text-fg-subtle ml-auto font-mono">
									Callout
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
