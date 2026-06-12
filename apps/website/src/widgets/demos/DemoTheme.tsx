import { cx, Icon } from "@dennation/typebook/react";
import { DEMO_FRAME, DEMO_TAG, REC_DOT } from "./demoClasses.js";

const CARD =
	"absolute inset-0 rounded-[12px] border p-5 flex flex-col gap-3 shadow-md";
const BAR = "h-2.25 rounded-[99px]";
const CHIP =
	"mt-auto h-7.5 w-27.5 rounded-[8px] grid place-items-center text-[11.5px] font-semibold text-white animate-[thHue_8s_linear_infinite] motion-reduce:animate-none";

/** DEMO 3 — Theming: dark mode + accent, crossfade loop. */
export function DemoTheme() {
	return (
		<div className={cx(DEMO_FRAME, "grid place-items-center p-7")}>
			<span className={DEMO_TAG}>
				<span className={REC_DOT} /> theme tokens
			</span>
			<div className="absolute right-4 top-4 z-4 w-11.5 h-6.5 rounded-[99px] bg-bg-tertiary border border-border">
				<div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-[99px] bg-accent grid place-items-center text-accent-fg animate-[thKnob_8s_ease_infinite] motion-reduce:animate-none">
					<Icon.moon size={11} />
				</div>
			</div>
			<div className="relative w-full max-w-80 aspect-[1.45]">
				<div
					className={cx(
						CARD,
						"bg-white [border-color:oklch(0.92_0.004_270)] animate-[thLight_8s_ease_infinite] motion-reduce:animate-none",
					)}
				>
					<div className="text-[14px] font-[650] tracking-[-0.02em] [color:oklch(0.2_0.012_270)]">
						Acme Docs
					</div>
					<div
						className={cx(BAR, "w-[90%] [background:oklch(0.92_0.01_270)]")}
					/>
					<div
						className={cx(BAR, "w-[62%] [background:oklch(0.92_0.01_270)]")}
					/>
					<div
						className={cx(BAR, "w-[74%] [background:oklch(0.92_0.01_270)]")}
					/>
					<div className={CHIP}>Get started</div>
				</div>
				<div
					className={cx(
						CARD,
						"[background:oklch(0.18_0.006_270)] [border-color:oklch(0.3_0.009_270)] opacity-0 animate-[thDark_8s_ease_infinite] motion-reduce:animate-none motion-reduce:opacity-0",
					)}
				>
					<div className="text-[14px] font-[650] tracking-[-0.02em] [color:oklch(0.95_0.004_270)]">
						Acme Docs
					</div>
					<div
						className={cx(BAR, "w-[90%] [background:oklch(0.3_0.01_270)]")}
					/>
					<div
						className={cx(BAR, "w-[62%] [background:oklch(0.3_0.01_270)]")}
					/>
					<div
						className={cx(BAR, "w-[74%] [background:oklch(0.3_0.01_270)]")}
					/>
					<div className={CHIP}>Get started</div>
				</div>
			</div>
		</div>
	);
}
