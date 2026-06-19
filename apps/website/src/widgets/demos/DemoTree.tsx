import { cx, Icon } from "@dennation/typebook/react";
import { DEMO_FRAME, DEMO_TAG, REC_DOT } from "./demoClasses";

const ANIM =
	"animate-[dtIn_6.5s_ease_infinite] motion-reduce:animate-none motion-reduce:opacity-100";

const FS = [
	{ t: <span className="text-accent">content/docs</span>, d: 0 },
	{
		t: (
			<>
				├─ index<span className="text-fg-subtle">.mdx</span>
			</>
		),
		d: 0.5,
	},
	{
		t: (
			<>
				├─ <span className="text-accent">getting-started/</span>
			</>
		),
		d: 0.9,
	},
	{
		t: (
			<>
				│&nbsp;&nbsp;├─ installation<span className="text-fg-subtle">.mdx</span>
			</>
		),
		d: 1.3,
	},
	{
		t: (
			<>
				│&nbsp;&nbsp;└─ quick-start<span className="text-fg-subtle">.mdx</span>
			</>
		),
		d: 1.7,
	},
	{
		t: (
			<>
				└─ <span className="text-accent">components/</span>
			</>
		),
		d: 2.1,
	},
	{
		t: (
			<>
				&nbsp;&nbsp;&nbsp;└─ callout<span className="text-fg-subtle">.mdx</span>
			</>
		),
		d: 2.5,
	},
];

const SB = [
	{ kind: "grp", t: "Getting Started", d: 1.0 },
	{ kind: "it", t: "Installation", d: 1.5 },
	{ kind: "it", t: "Quick Start", d: 1.9 },
	{ kind: "grp", t: "Components", d: 2.3 },
	{ kind: "it", t: "Callout", d: 2.7 },
] as const;

/** DEMO 2 — Filesystem maps to the sidebar automatically. */
export function DemoTree() {
	return (
		<div className={DEMO_FRAME}>
			<span className={DEMO_TAG}>
				<span className={REC_DOT} /> file-based routing
			</span>
			<div className="grid grid-cols-2 h-full">
				<div className="pt-11.5 px-5.5 pb-5.5 border-r border-border bg-code-bg font-mono text-[12px] leading-[1.95] text-fg-muted">
					{FS.map((r) => (
						<div
							className={cx("opacity-0 whitespace-nowrap", ANIM)}
							key={r.d}
							style={{ animationDelay: `${r.d}s` }}
						>
							{r.t}
						</div>
					))}
				</div>
				<div className="pt-11.5 px-4.5 pb-5.5 flex flex-col gap-0.75">
					{SB.map((r) =>
						r.kind === "grp" ? (
							<div
								className={cx(
									"text-[9.5px] font-semibold tracking-[0.07em] uppercase text-fg-subtle px-2 py-1 opacity-0",
									ANIM,
								)}
								key={r.t}
								style={{ animationDelay: `${r.d}s` }}
							>
								{r.t}
							</div>
						) : (
							<div
								className={cx(
									"flex items-center gap-2 text-[12.5px] text-fg-muted px-2 py-1.25 rounded-md opacity-0",
									ANIM,
								)}
								key={r.t}
								style={{ animationDelay: `${r.d}s` }}
							>
								<span className="w-1 h-1 rounded-[99px] bg-current opacity-40" />
								{r.t}
							</div>
						),
					)}
				</div>
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-4 w-8.5 h-8.5 rounded-[99px] bg-bg border border-border grid place-items-center text-accent shadow-sm">
					<Icon.chevR size={17} />
				</div>
			</div>
		</div>
	);
}
