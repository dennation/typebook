import { ARROW_CLASS, buttonClass, cx, Icon } from "@dennation/typebook/react";
import { CopyCommand } from "../features/CopyCommand.js";
import { CONTAINER } from "../shared/lib/landingLayout.js";

const MINI_IT =
	"flex items-center gap-[8px] text-[12.5px] text-fg-muted px-[8px] py-[5px] rounded-[6px]";
const DOT = "w-[4px] h-[4px] rounded-[99px] bg-current opacity-35";

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
			className="relative pt-[84px] pb-[120px] overflow-hidden max-[860px]:pb-[84px] max-[620px]:pt-[56px]"
			id="top"
		>
			<HeroBg />
			<HeroGrid />
			<div
				className={cx(
					CONTAINER,
					"relative z-[1] flex flex-col items-center text-center",
				)}
			>
				<div className="inline-flex items-center gap-[9px] h-[30px] pl-[13px] pr-[6px] border border-border rounded-[99px] bg-[color-mix(in_oklch,var(--bg)_60%,transparent)] backdrop-blur-[6px] text-[13px] text-fg-muted mb-[30px]">
					<span className="font-mono text-[11px] font-semibold px-[8px] py-[2px] rounded-[99px] bg-accent-soft text-accent border border-accent-soft-border">
						v2.4
					</span>
					<span>Instant ⌘K search is here</span>
					<span className="text-fg-subtle inline-flex">
						<Icon.chevR size={13} />
					</span>
				</div>
				<h1 className="text-[clamp(40px,6.4vw,72px)] font-[680] tracking-[-0.035em] leading-[1.02] m-0 mb-[22px] max-w-[16ch] [text-wrap:balance]">
					Docs your readers{" "}
					<span className="bg-[linear-gradient(110deg,var(--accent),oklch(0.62_0.17_320))] bg-clip-text text-transparent">
						actually finish
					</span>
					.
				</h1>
				<p className="text-[clamp(17px,2.1vw,20px)] leading-[1.6] text-fg-muted m-0 mb-[36px] max-w-[56ch] [text-wrap:pretty]">
					Typebok is a content-first documentation framework for React. Write
					plain
					<strong className="text-fg font-semibold"> Markdown or MDX</strong> —
					ship a polished sidebar, instant search, syntax highlighting and dark
					mode with{" "}
					<strong className="text-fg font-semibold">zero config</strong>.
				</p>
				<div className="flex items-center gap-[12px] flex-wrap justify-center mb-[22px]">
					<a className={buttonClass("primary", "lg")} href={docsHref}>
						Read the docs <Icon.chevR size={16} className={ARROW_CLASS} />
					</a>
					<CopyCommand cmd={command} />
				</div>
				<div className="flex items-center gap-[14px] text-[13px] text-fg-subtle mt-[4px] flex-wrap justify-center">
					<span className="text-[12px] tracking-[0.03em]">Drops into</span>
					<span className="inline-flex items-center gap-[7px] text-fg-muted font-medium">
						<Icon.box size={14} /> Next.js
					</span>
					<span className="w-[3px] h-[3px] rounded-[99px] bg-border-strong" />
					<span className="inline-flex items-center gap-[7px] text-fg-muted font-medium">
						<Icon.zap size={14} /> Vite
					</span>
					<span className="w-[3px] h-[3px] rounded-[99px] bg-border-strong" />
					<span className="inline-flex items-center gap-[7px] text-fg-muted font-medium">
						<Icon.rocket size={14} /> Astro
					</span>
				</div>

				<div className="relative z-[1] w-full mt-[64px] [perspective:1800px] reveal">
					<div className="border border-border rounded-[14px] overflow-hidden bg-bg shadow-lg">
						<div className="flex items-center gap-[8px] h-[42px] px-[15px] bg-bg-secondary border-b border-border">
							<div className="flex gap-[7px]">
								<i className="w-[11px] h-[11px] rounded-[99px] bg-border-strong not-italic" />
								<i className="w-[11px] h-[11px] rounded-[99px] bg-border-strong not-italic" />
								<i className="w-[11px] h-[11px] rounded-[99px] bg-border-strong not-italic" />
							</div>
							<span className="mx-auto font-mono text-[11.5px] text-fg-subtle bg-bg border border-border rounded-[7px] px-[16px] py-[4px] inline-flex items-center gap-[7px]">
								<Icon.link size={11} />
								acme.dev/docs/components/callout
							</span>
						</div>
						<div className="grid grid-cols-[210px_1fr_170px] min-h-[430px] max-[1000px]:grid-cols-[180px_1fr] max-[620px]:grid-cols-1">
							<aside className="border-r border-border px-[14px] py-[20px] flex flex-col gap-[18px] bg-bg max-[620px]:hidden">
								<div className="flex flex-col gap-[5px]">
									<div className="text-[10px] font-semibold tracking-[0.07em] uppercase text-fg-subtle px-[8px] mb-[3px] flex items-center gap-[7px]">
										<Icon.rocket size={12} /> Getting Started
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
								<div className="flex flex-col gap-[5px]">
									<div className="text-[10px] font-semibold tracking-[0.07em] uppercase text-fg-subtle px-[8px] mb-[3px] flex items-center gap-[7px]">
										<Icon.box size={12} /> Components
									</div>
									<div className="flex items-center gap-[8px] text-[12.5px] px-[8px] py-[5px] rounded-[6px] bg-accent-soft text-accent font-medium">
										<span className="w-[4px] h-[4px] rounded-[99px] bg-current" />
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
							<div className="px-[34px] py-[30px] min-w-0">
								<div className="text-[11.5px] text-fg-subtle mb-[16px]">
									<b className="text-fg-muted font-medium">Components</b> /
									Callout
								</div>
								<h2 className="text-[27px] font-[650] tracking-[-0.025em] m-0 mb-[12px]">
									Callout
								</h2>
								<p className="text-[14px] leading-[1.6] text-fg-muted m-0 mb-[20px] max-w-[46ch]">
									Draw the reader's eye to notes, tips, warnings and dangers —
									the most-used MDX component in Typebok.
								</p>
								<div className="flex gap-[11px] px-[15px] py-[13px] rounded-[9px] text-[13px] leading-[1.5] border border-[color-mix(in_oklch,oklch(0.68_0.15_70)_35%,var(--border))] bg-[color-mix(in_oklch,oklch(0.68_0.15_70)_9%,var(--bg))] mt-[4px]">
									<span className="shrink-0 mt-px [color:oklch(0.68_0.15_70)]">
										<Icon.warn size={17} />
									</span>
									<span>
										<span className="font-semibold text-fg block mb-[2px]">
											Heads up
										</span>
										<span className="text-fg-muted">
											This API is experimental and may change.
										</span>
									</span>
								</div>
							</div>
							<div className="border-l border-border pt-[30px] pl-[18px] flex flex-col gap-[10px] max-[1000px]:hidden">
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
					<div className="absolute z-[3] right-[-8px] bottom-[-34px] w-[min(360px,76vw)] bg-bg border border-border-strong rounded-[14px] shadow-lg overflow-hidden animate-[floaty_6s_ease-in-out_infinite] motion-reduce:animate-none max-[620px]:hidden">
						<div className="flex items-center gap-[10px] px-[15px] py-[13px] border-b border-border">
							<span className="text-fg-subtle shrink-0 inline-flex">
								<Icon.search size={16} />
							</span>
							<span className="text-[14.5px] relative whitespace-nowrap overflow-hidden">
								<span className="text-fg">callout</span>
								<span className="inline-block w-[1.5px] h-[16px] bg-accent align-[-3px] ml-px animate-[blink_1s_step-end_infinite] motion-reduce:animate-none" />
							</span>
							<span className="font-mono text-[11px] text-fg-muted border border-border rounded-[5px] px-[6px] py-[2px] ml-auto">
								esc
							</span>
						</div>
						<div className="p-[7px] flex flex-col gap-[2px]">
							<div className="flex items-center gap-[11px] px-[11px] py-[9px] rounded-[8px] bg-accent-soft">
								<span className="text-accent shrink-0 inline-flex">
									<Icon.box size={15} />
								</span>
								<span className="text-[13px] font-medium text-accent">
									Callout
								</span>
								<span className="ml-auto text-accent inline-flex">
									<Icon.enter size={14} />
								</span>
							</div>
							<div className="flex items-center gap-[11px] px-[11px] py-[9px] rounded-[8px]">
								<span className="text-fg-subtle shrink-0 inline-flex">
									<Icon.hash size={15} />
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
