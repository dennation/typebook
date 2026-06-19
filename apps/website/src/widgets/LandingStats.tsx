import type { ReactNode } from "react";
import { CONTAINER } from "../shared/lib/landingLayout";

const ITEMS: { num: ReactNode; lbl: string }[] = [
	{
		num: <span>7</span>,
		lbl: "Bundlers, one typebook() plugin — Vite to Farm",
	},
	{
		num: <span>0</span>,
		lbl: "Story files or registries to keep in sync",
	},
	{
		num: <span>1</span>,
		lbl: "Handle behind Story, Variants, Matrix & Playground",
	},
	{
		num: (
			<>
				<span>100</span>
				<span className="text-accent">%</span>
			</>
		),
		lbl: "Type-safe — props, axes and values checked",
	},
];

const STAT =
	"px-7 py-8 border-r border-border last:border-r-0 " +
	"max-[860px]:[&:nth-child(2)]:border-r-0 max-[860px]:[&:nth-child(-n+2)]:border-b max-[860px]:[&:nth-child(-n+2)]:border-b-border " +
	"max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:border-b-border max-[620px]:last:border-b-0";

/** Landing key-metrics band. */
export function LandingStats() {
	return (
		<section className="pt-0 pb-30 max-[860px]:pb-21">
			<div className={CONTAINER}>
				<div className="grid grid-cols-4 border border-border rounded-[14px] overflow-hidden bg-bg max-[860px]:grid-cols-2 max-[620px]:grid-cols-1 reveal">
					{ITEMS.map((s) => (
						<div className={STAT} key={s.lbl}>
							<div className="text-[40px] font-[680] tracking-[-0.03em] leading-none mb-2">
								{s.num}
							</div>
							<div className="text-[13.5px] text-fg-muted leading-[1.5]">
								{s.lbl}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
