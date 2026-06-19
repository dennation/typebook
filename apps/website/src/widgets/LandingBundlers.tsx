import { cx } from "@dennation/typebook/react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";

const BUNDLERS = [
	"Vite",
	"Rollup",
	"Rolldown",
	"webpack",
	"Rspack",
	"esbuild",
	"Farm",
];

/** "Works with every bundler" band — one unplugin factory, published per bundler. */
export function LandingBundlers() {
	return (
		<section className={cx(SECTION_PAD, "pt-0")} id="bundlers">
			<div className={CONTAINER}>
				<div className="reveal rounded-[18px] border border-border bg-bg-secondary px-8 py-10 text-center max-[620px]:px-5">
					<div className="font-mono text-[12px] font-semibold tracking-[0.04em] text-accent uppercase mb-3">
						No bundler is privileged
					</div>
					<h2 className="text-[clamp(24px,3vw,32px)] font-[650] tracking-[-0.025em] leading-[1.12] m-0 mb-3 text-balance">
						One <code className="font-mono text-accent">typebook()</code>{" "}
						plugin, every bundler
					</h2>
					<p className="text-[15.5px] leading-[1.6] text-fg-muted m-0 mb-8 max-w-[52ch] mx-auto text-pretty">
						The same factory ships for seven bundlers via{" "}
						<a
							className="text-accent hover:underline"
							href="https://unplugin.unjs.io"
						>
							unplugin
						</a>
						. Same config, same build-time injection, wherever you build.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-2.5">
						{BUNDLERS.map((b) => (
							<span
								key={b}
								className="inline-flex items-center gap-2 h-9 px-4 rounded-[99px] border border-border bg-bg text-[13.5px] font-medium text-fg-muted"
							>
								<span className="w-1.5 h-1.5 rounded-[99px] bg-accent" />
								{b}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
