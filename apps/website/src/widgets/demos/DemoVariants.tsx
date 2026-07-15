import { buttonClass, cx } from "@dennation/typebook/react";
import { IconBrandTypescript } from "@tabler/icons-react";
import { DEMO_FRAME, DEMO_TAG, REC_DOT } from "./demoClasses";

const AXIS =
	"text-[10px] font-semibold tracking-[0.06em] uppercase text-fg-subtle mb-2";
const STRIP = "flex flex-wrap items-center gap-2.5";

/** DEMO 1 — Variant grids generated from a component's TypeScript prop types. */
export function DemoVariants() {
	return (
		<div
			className={cx(
				DEMO_FRAME,
				"grid place-items-center p-7.5 bg-[radial-gradient(100%_70%_at_50%_0%,color-mix(in_oklch,var(--accent)_7%,transparent),transparent_70%)]",
			)}
		>
			<span className={DEMO_TAG}>
				<span className={REC_DOT} /> variant grid
			</span>
			<div className="w-full max-w-82.5 bg-bg border border-border-strong rounded-[13px] shadow-lg overflow-hidden">
				<div className="flex items-center gap-2 px-3.75 py-2.5 border-b border-border bg-bg-secondary font-mono text-[11px] text-fg-subtle">
					<span className="text-accent inline-flex">
						<IconBrandTypescript size={14} />
					</span>
					Button.tsx
					<span className="ml-auto rounded-[99px] border border-border bg-bg px-2 py-0.5 text-[10px]">
						.Variants axis="size"
					</span>
				</div>
				<div className="p-5">
					<div className={AXIS}>size</div>
					<div className={STRIP}>
						<button type="button" className={buttonClass("primary", "sm")}>
							Button
						</button>
						<button type="button" className={buttonClass("primary", "md")}>
							Button
						</button>
						<button type="button" className={buttonClass("primary", "lg")}>
							Button
						</button>
					</div>
					<div className={cx(AXIS, "mt-5")}>variant</div>
					<div className={STRIP}>
						<button type="button" className={buttonClass("primary", "sm")}>
							primary
						</button>
						<button type="button" className={buttonClass("ghost", "sm")}>
							ghost
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
