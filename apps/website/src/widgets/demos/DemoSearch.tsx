import { cx } from "@dennation/typebook/react";
import {
	Book,
	Box,
	CornerDownLeft,
	Hash,
	Palette,
	Search,
	Settings,
} from "lucide-react";
import {
	DEMO_FRAME,
	DEMO_TAG,
	DS_RI,
	DS_ROW,
	DS_RP,
	DS_RT,
	REC_DOT,
} from "./demoClasses";

/** DEMO 1 — Command palette (⌘K) instant search. */
export function DemoSearch() {
	return (
		<div
			className={cx(
				DEMO_FRAME,
				"grid place-items-center p-7.5 bg-[radial-gradient(100%_70%_at_50%_0%,color-mix(in_oklch,var(--accent)_7%,transparent),transparent_70%)]",
			)}
		>
			<span className={DEMO_TAG}>
				<span className={REC_DOT} /> ⌘K search
			</span>
			<div className="w-full max-w-82.5 bg-bg border border-border-strong rounded-[13px] shadow-lg overflow-hidden">
				<div className="flex items-center gap-2.5 px-3.75 py-3.25 border-b border-border">
					<span className={DS_RI}>
						<Search size={16} />
					</span>
					<span className="text-[14.5px] text-fg relative whitespace-nowrap overflow-hidden">
						<span className="inline-block overflow-hidden whitespace-nowrap align-bottom">
							callout
						</span>
						<span className="inline-block w-[1.5px] h-4 bg-accent align-[-3px] ml-px animate-[blink_1s_step-end_infinite] motion-reduce:animate-none" />
					</span>
				</div>
				<div className="p-1.75 flex flex-col gap-0.5">
					<div
						className={cx(
							DS_ROW,
							"bg-accent-soft animate-[dsSel_7s_ease_infinite] motion-reduce:animate-none",
						)}
					>
						<span className={cx(DS_RI, "text-accent")}>
							<Box size={15} />
						</span>
						<span className={cx(DS_RT, "text-accent")}>Callout</span>
						<span className="ml-auto text-accent inline-flex opacity-0 animate-[dsEnter_7s_ease_infinite] motion-reduce:animate-none">
							<CornerDownLeft size={14} />
						</span>
					</div>
					<div className={DS_ROW}>
						<span className={DS_RI}>
							<Hash size={15} />
						</span>
						<span className={DS_RT}>Callout props</span>
						<span className={DS_RP}>Callout</span>
					</div>
					<div
						className={cx(
							DS_ROW,
							"animate-[dsCollapse_7s_ease_infinite] motion-reduce:animate-none",
						)}
					>
						<span className={DS_RI}>
							<Book size={15} />
						</span>
						<span className={DS_RT}>Installation</span>
						<span className={DS_RP}>Start</span>
					</div>
					<div
						className={cx(
							DS_ROW,
							"animate-[dsCollapse_7s_ease_infinite] motion-reduce:animate-none",
						)}
					>
						<span className={DS_RI}>
							<Palette size={15} />
						</span>
						<span className={DS_RT}>Theming</span>
						<span className={DS_RP}>Guides</span>
					</div>
					<div
						className={cx(
							DS_ROW,
							"animate-[dsCollapse_7s_ease_infinite] motion-reduce:animate-none",
						)}
					>
						<span className={DS_RI}>
							<Settings size={15} />
						</span>
						<span className={DS_RT}>createDocs()</span>
						<span className={DS_RP}>API</span>
					</div>
				</div>
			</div>
		</div>
	);
}
