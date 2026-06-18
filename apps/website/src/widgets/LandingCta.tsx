import {
	ARROW_CLASS,
	buttonClass,
	CopyCommand,
	Icon,
} from "@dennation/typebook/react";
import { CONTAINER } from "../shared/lib/landingLayout";

export interface LandingCtaProps {
	/** Link target for the "Get started free" CTA. */
	docsHref?: string;
	/** Install command shown in the copy pill. */
	command?: string;
}

/** Landing final call-to-action band. */
export function LandingCta({
	docsHref = "#",
	command = "npx create-typebok@latest",
}: LandingCtaProps) {
	return (
		<section className="pt-0 pb-30 max-[860px]:pb-21">
			<div className={CONTAINER}>
				<div className="relative overflow-hidden rounded-[22px] border border-border bg-bg-secondary px-10 py-18 text-center max-[620px]:px-6 max-[620px]:py-12 reveal">
					<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(80%_120%_at_50%_0%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_65%)]" />
					<div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_80%_at_50%_30%,#000,transparent_75%)] [-webkit-mask-image:radial-gradient(70%_80%_at_50%_30%,#000,transparent_75%)]" />
					<div className="relative z-1 flex flex-col items-center">
						<span className="w-12 h-12 rounded-[13px] bg-fg text-bg grid place-items-center font-mono font-semibold text-[24px] mb-6">
							T
						</span>
						<h2 className="text-[clamp(30px,4.4vw,46px)] font-[670] tracking-[-0.03em] leading-[1.05] m-0 mb-4 [text-wrap:balance]">
							Ship docs you're proud of
						</h2>
						<p className="text-[17px] text-fg-muted m-0 mb-8 max-w-[48ch] leading-[1.6]">
							Scaffold a complete documentation site in one command. No design
							work, no search service, no lock-in.
						</p>
						<div className="flex gap-3 flex-wrap justify-center items-center">
							<a className={buttonClass("primary", "lg")} href={docsHref}>
								Get started free{" "}
								<Icon.chevR size={16} className={ARROW_CLASS} />
							</a>
							<CopyCommand cmd={command} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
