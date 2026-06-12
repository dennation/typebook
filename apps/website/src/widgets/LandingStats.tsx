import type { ReactNode } from "react";
import { CONTAINER } from "../shared/lib/landingLayout.js";

const ITEMS: { num: ReactNode; lbl: string }[] = [
	{
		num: (
			<>
				<span>4.2</span>
				<span className="text-accent">kb</span>
			</>
		),
		lbl: "Runtime JS shipped to readers, gzipped",
	},
	{
		num: <span>0</span>,
		lbl: "Config files needed to get a working site",
	},
	{
		num: (
			<>
				<span>100</span>
				<span className="text-accent">/100</span>
			</>
		),
		lbl: "Lighthouse performance on the starter",
	},
	{
		num: (
			<>
				<span>30</span>
				<span className="text-accent">s</span>
			</>
		),
		lbl: "From empty folder to live docs page",
	},
];

const STAT =
	"px-[28px] py-[32px] border-r border-border last:border-r-0 " +
	"max-[860px]:[&:nth-child(2)]:border-r-0 max-[860px]:[&:nth-child(-n+2)]:border-b max-[860px]:[&:nth-child(-n+2)]:border-b-border " +
	"max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:border-b-border max-[620px]:last:border-b-0";

/** Landing key-metrics band. */
export function LandingStats() {
	return (
		<section className="pt-0 pb-[120px] max-[860px]:pb-[84px]">
			<div className={CONTAINER}>
				<div className="grid grid-cols-4 border border-border rounded-[14px] overflow-hidden bg-bg max-[860px]:grid-cols-2 max-[620px]:grid-cols-1 reveal">
					{ITEMS.map((s) => (
						<div className={STAT} key={s.lbl}>
							<div className="text-[40px] font-[680] tracking-[-0.03em] leading-none mb-[8px]">
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
