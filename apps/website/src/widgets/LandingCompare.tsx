import { cx, Icon } from "@dennation/typebook/react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";

const COLS: { name: string; tag: string; own?: boolean }[] = [
	{ name: "Typebok", tag: "this", own: true },
	{ name: "Nextra", tag: "MDX + Next" },
	{ name: "Docusaurus", tag: "React" },
	{ name: "Mintlify", tag: "hosted SaaS" },
];

const Y = (
	<span className="text-accent inline-grid place-items-center">
		<Icon.check size={17} />
	</span>
);
const N = (
	<span className="text-fg-subtle opacity-55 inline-grid place-items-center">
		<Icon.danger size={16} />
	</span>
);
const P = (t: string) => (
	<span className="text-[12px] text-fg-subtle italic">{t}</span>
);

const ROWS: { f: string; s: string; v: ReactNode[] }[] = [
	{
		f: "Write in Markdown / MDX",
		s: "No proprietary authoring format",
		v: [Y, Y, Y, Y],
	},
	{
		f: "Filesystem-driven sidebar",
		s: "Folders map to navigation",
		v: [Y, Y, P("partial"), N],
	},
	{
		f: "Zero-config search",
		s: "Built-in, no external service",
		v: [Y, P("plugin"), P("plugin"), Y],
	},
	{
		f: "Token-level theming",
		s: "Restyle from one CSS file",
		v: [Y, P("limited"), Y, P("limited")],
	},
	{ f: "Self-host, no lock-in", s: "Your repo, your CDN", v: [Y, Y, Y, N] },
	{ f: "Free & open source", s: "MIT licensed", v: [Y, Y, Y, N] },
	{
		f: "Ships components",
		s: "Callouts, tabs, steps, cards",
		v: [Y, P("basic"), P("basic"), Y],
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
					title="Familiar power, without the trade-offs"
					sub="Keep the authoring comfort of Markdown and the design control of components — self-hosted, open source, and free."
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
