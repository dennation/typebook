import { Icon } from "@dennation/typebook/react";
import { DEMO_FRAME, DEMO_TAG, REC_DOT } from "./demoClasses.js";

/** DEMO 4 — MDX component: code compiles to a rendered block. */
export function DemoMdx() {
	return (
		<div className={DEMO_FRAME}>
			<span className={DEMO_TAG}>
				<span className={REC_DOT} /> .mdx → rendered
			</span>
			<div className="pt-[40px] px-[26px] pb-[26px] h-full flex flex-col justify-center">
				<div className="border border-border rounded-t-[10px] border-b-0 bg-code-bg px-[16px] py-[14px] font-mono text-[12px] leading-[1.7]">
					<div>
						<span className="text-fg-subtle mr-[12px] opacity-50">1</span>
						<span className="tok-punc">&lt;</span>
						<span className="tok-tag">Callout</span>{" "}
						<span className="tok-attr">type</span>
						<span className="tok-punc">=</span>
						<span className="tok-str">"warning"</span>
						<span className="tok-punc">&gt;</span>
					</div>
					<div>
						<span className="text-fg-subtle mr-[12px] opacity-50">2</span>
						&nbsp;&nbsp;This runs on the client only.
					</div>
					<div>
						<span className="text-fg-subtle mr-[12px] opacity-50">3</span>
						<span className="tok-punc">&lt;/</span>
						<span className="tok-tag">Callout</span>
						<span className="tok-punc">&gt;</span>
					</div>
				</div>
				<div className="border border-dashed border-border-strong border-t-0 rounded-b-[10px] p-[16px] grid place-items-center min-h-[120px]">
					<div className="w-full opacity-0 animate-[dmPop_5.5s_ease_infinite] motion-reduce:animate-none motion-reduce:opacity-100">
						<div className="flex gap-[11px] px-[15px] py-[13px] rounded-[9px] text-[13px] leading-[1.5] border border-[color-mix(in_oklch,oklch(0.68_0.15_70)_35%,var(--border))] bg-[color-mix(in_oklch,oklch(0.68_0.15_70)_9%,var(--bg))]">
							<span className="shrink-0 mt-px [color:oklch(0.68_0.15_70)]">
								<Icon.warn size={17} />
							</span>
							<span>
								<span className="font-semibold text-fg block mb-[2px]">
									Heads up
								</span>
								<span className="text-fg-muted">
									This runs on the client only.
								</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
