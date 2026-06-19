import { cx } from "@dennation/typebook/react";
import { Check, CircleX } from "lucide-react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";

const COLS: { name: string; tag: string; own?: boolean }[] = [
	{ name: "Typebok", tag: "this", own: true },
	{ name: "Storybook", tag: "stories" },
	{ name: "react-docgen", tag: "props only" },
	{ name: "Docusaurus", tag: "MDX docs" },
];

const Y = (
	<span className="text-accent inline-grid place-items-center">
		<Check size={17} />
	</span>
);
const N = (
	<span className="text-fg-subtle opacity-55 inline-grid place-items-center">
		<CircleX size={16} />
	</span>
);
const P = (t: string) => (
	<span className="text-[12px] text-fg-subtle italic">{t}</span>
);

const ROWS: { f: string; s: string; v: ReactNode[] }[] = [
	{
		f: "Variants from TS types",
		s: "No .stories files to hand-write",
		v: [Y, N, N, N],
	},
	{
		f: "Auto grids & matrices",
		s: "Cross-product from unions",
		v: [Y, P("manual"), N, N],
	},
	{
		f: "Interactive playground",
		s: "Controls inferred, zero config",
		v: [Y, P("addon"), N, N],
	},
	{
		f: "Zero runtime metadata",
		s: "Props are static literals",
		v: [Y, N, N, P("n/a")],
	},
	{
		f: "Exact snippet source",
		s: "Sliced from your code at build",
		v: [Y, P("partial"), N, N],
	},
	{
		f: "Every bundler",
		s: "One unplugin factory",
		v: [Y, P("limited"), Y, N],
	},
	{
		f: "Ships a docs kit",
		s: "Callouts, tabs, sidebar, toc…",
		v: [Y, N, N, P("basic")],
	},
];

const CELL = "px-5 py-4 text-left border-b border-border";
const OWN_CELL =
	"bg-[color-mix(in_oklch,var(--accent)_6%,var(--bg))] border-l border-r border-l-accent-soft-border border-r-accent-soft-border relative";
const FEAT_CELL = "text-[14px] font-medium text-fg w-[34%]";

/** Landing comparison table (Typebok vs alternatives). */
export function LandingCompare() {
	return (
		<section
			className={cx(
				SECTION_PAD,
				"bg-bg-secondary border-t border-b border-border",
			)}
			id="compare"
		>
			<div className={CONTAINER}>
				<SectionHead
					kicker="How it compares"
					title="Stories, without the Storybook tax"
					sub="No story files to maintain, no registry to wire, no runtime to ship. Your component's types are the single source of truth."
				/>
				<div className="overflow-x-auto reveal">
					<table className="w-full border-separate border-spacing-0 min-w-180 bg-bg border border-border rounded-[14px] overflow-hidden shadow-md">
						<thead>
							<tr>
								<th
									className={cx(
										CELL,
										FEAT_CELL,
										"bg-bg-secondary align-bottom",
									)}
								>
									&nbsp;
								</th>
								{COLS.map((c) => (
									<th
										key={c.name}
										className={cx(
											CELL,
											"text-center text-[13px] font-semibold text-fg-muted align-bottom",
											c.own
												? "bg-[color-mix(in_oklch,var(--accent)_11%,var(--bg))] border-l border-r border-l-accent-soft-border border-r-accent-soft-border border-t-2 border-t-accent relative"
												: "bg-bg-secondary",
										)}
									>
										<span
											className={cx(
												"text-[15px] font-[650] tracking-[-0.01em] block",
												c.own ? "text-accent" : "text-fg",
											)}
										>
											{c.name}
										</span>
										<span className="block text-[11px] font-[450] text-fg-subtle mt-0.5">
											{c.tag}
										</span>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{ROWS.map((r, i) => {
								const last = i === ROWS.length - 1;
								return (
									<tr key={r.f}>
										<td className={cx(CELL, FEAT_CELL, last && "border-b-0")}>
											{r.f}
											<small className="block font-normal text-[12.5px] text-fg-subtle mt-0.5">
												{r.s}
											</small>
										</td>
										{r.v.map((v, k) => (
											<td
												key={COLS[k].name}
												className={cx(
													CELL,
													"text-center",
													COLS[k].own
														? cx(
																OWN_CELL,
																last && "border-b border-b-accent-soft-border",
															)
														: last && "border-b-0",
												)}
											>
												{v}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
