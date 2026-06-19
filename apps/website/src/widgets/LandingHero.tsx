import {
	ARROW_CLASS,
	allOf,
	buttonClass,
	CodeBlock,
	CopyCommand,
	cx,
	Variants,
} from "@dennation/typebook/react";
import { ChevronRight, Sparkles, Wand2, Zap } from "lucide-react";
import { CONTAINER } from "../shared/lib/landingLayout";
import { demoButton } from "./demos/demoMeta";

const HeroBg = () => (
	<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_oklch,var(--accent)_11%,transparent),transparent_60%)]" />
);
const HeroGrid = () => (
	<div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(80%_60%_at_50%_0%,#000_0%,transparent_75%)] [-webkit-mask-image:radial-gradient(80%_60%_at_50%_0%,#000_0%,transparent_75%)]" />
);

const HERO_CODE = `import { getComponentMeta, allOf } from "@dennation/typebook/react";
import { Variants } from "@dennation/typebook/react";
import { Button } from "./Button";

// register once — the plugin injects the prop types
const button = getComponentMeta(Button);

// every value of the union, straight from the type
<Variants of={button} items={allOf(button, "variant")} />`;

export interface LandingHeroProps {
	/** Link target for the "Read the docs" CTA. */
	docsHref?: string;
	/** Install command shown in the copy pill. */
	command?: string;
}

/** Landing hero: the killer feature first — code on the left, the very same
    code rendered live by Typebok on the right. */
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
				<div className="inline-flex items-center gap-2 h-7.5 pl-3 pr-3.5 border border-border rounded-[99px] bg-[color-mix(in_oklch,var(--bg)_60%,transparent)] backdrop-blur-[6px] text-[13px] text-fg-muted mb-7.5">
					<span className="text-accent inline-flex">
						<Sparkles size={13} />
					</span>
					<span>A Storybook that writes itself from your TypeScript types</span>
				</div>
				<h1 className="text-[clamp(40px,6.4vw,72px)] font-[680] tracking-[-0.035em] leading-[1.02] m-0 mb-5.5 max-w-[18ch] text-balance">
					Every variant,{" "}
					<span className="bg-[linear-gradient(110deg,var(--accent),oklch(0.62_0.17_320))] bg-clip-text text-transparent">
						rendered from your types
					</span>
					.
				</h1>
				<p className="text-[clamp(17px,2.1vw,20px)] leading-[1.6] text-fg-muted m-0 mb-9 max-w-[58ch] text-pretty">
					Register a React component once. Typebok reads its prop types at{" "}
					<strong className="text-fg font-semibold">build time</strong> and
					renders every size, state and combination —{" "}
					<strong className="text-fg font-semibold">no stories to write</strong>
					, nothing to keep in sync, zero runtime cost.
				</p>
				<div className="flex items-center gap-3 flex-wrap justify-center mb-5.5">
					<a className={buttonClass("primary", "lg")} href={docsHref}>
						Read the docs <ChevronRight size={16} className={ARROW_CLASS} />
					</a>
					<CopyCommand cmd={command} />
				</div>
				<div className="flex items-center gap-2.5 text-[12.5px] text-fg-subtle mt-1">
					<Zap size={13} className="text-accent" />
					<span>
						One plugin — Vite, webpack, Rollup, Rspack, esbuild &amp; more
					</span>
				</div>

				{/* The live proof: this code renders the panel beside it. */}
				<div className="relative z-1 w-full mt-16 reveal">
					<div className="border border-border rounded-[14px] overflow-hidden bg-bg shadow-lg text-left grid grid-cols-2 max-[860px]:grid-cols-1">
						<div className="border-r border-border max-[860px]:border-r-0 max-[860px]:border-b min-w-0">
							<div className="flex items-center gap-2 h-10.5 px-3.75 bg-bg-secondary border-b border-border">
								<div className="flex gap-1.75">
									<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
									<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
									<i className="w-2.75 h-2.75 rounded-[99px] bg-border-strong not-italic" />
								</div>
								<span className="ml-1.5 font-mono text-[11.5px] text-fg-subtle">
									button.tsx
								</span>
							</div>
							<div className="text-[12.5px] [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_.tb-code]:!rounded-none [&_.tb-code]:!border-0">
								<CodeBlock code={HERO_CODE} lang="tsx" />
							</div>
						</div>
						<div className="min-w-0 flex flex-col">
							<div className="flex items-center gap-2 h-10.5 px-3.75 bg-bg-secondary border-b border-border">
								<span className="inline-flex items-center gap-1.75 font-mono text-[11px] text-accent font-semibold">
									<Wand2 size={12} /> rendered live, on this page
								</span>
								<span className="ml-auto flex items-center gap-1.5 text-[11px] text-fg-subtle">
									<span className="w-1.75 h-1.75 rounded-[99px] bg-[oklch(0.6_0.2_145)] animate-[rec_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
									live
								</span>
							</div>
							<div className="flex-1 grid place-items-center p-7">
								<Variants
									of={demoButton}
									items={allOf(demoButton, "variant")}
									columns={2}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
