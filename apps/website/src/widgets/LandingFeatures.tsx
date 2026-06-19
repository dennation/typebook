import {
	allOf,
	cx,
	Matrix,
	Playground,
	Snippet,
	Variants,
} from "@dennation/typebook/react";
import {
	Check,
	Code2,
	Grid3x3,
	LayoutGrid,
	SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";
import { DemoButton } from "./demos/DemoButton";
import { demoButton } from "./demos/demoMeta";

interface Feature {
	icon: ReactNode;
	call: string;
	demo: ReactNode;
	flip: boolean;
	title: string;
	body: string;
	list: { id: string; text: ReactNode }[];
}

const FEATURES: Feature[] = [
	{
		icon: <LayoutGrid size={22} />,
		call: 'allOf(button, "variant")',
		demo: (
			<Variants
				of={demoButton}
				items={allOf(demoButton, "variant")}
				columns={2}
			/>
		),
		flip: false,
		title: "Grids that grow with your types",
		body: "allOf() reads a prop's literal-union (or boolean) type straight from the handle. Add a value to the union and the grid grows by itself — no row to add, no fixture to update.",
		list: [
			{
				id: "union",
				text: (
					<>
						Every value of a <b>union</b>, automatically
					</>
				),
			},
			{
				id: "bool",
				text: (
					<>
						Booleans render their <b>true / false</b> states
					</>
				),
			},
			{
				id: "explicit",
				text: (
					<>
						Or list values by hand with <b>values()</b>
					</>
				),
			},
		],
	},
	{
		icon: <Grid3x3 size={22} />,
		call: "x={variant} y={[size]}",
		demo: (
			<Matrix
				of={demoButton}
				x={allOf(demoButton, "variant")}
				y={[allOf(demoButton, "size")]}
			/>
		),
		flip: true,
		title: "See every combination at once",
		body: "<Matrix> renders the cross-product of two axes as a labeled table — variant against size, state against tone — so a regression in one corner is impossible to miss.",
		list: [
			{
				id: "cross",
				text: (
					<>
						Two type-driven axes, <b>cross-multiplied</b>
					</>
				),
			},
			{
				id: "labels",
				text: (
					<>
						Rows and columns <b>labeled</b> from the values
					</>
				),
			},
			{ id: "review", text: <>Catch the broken corner at a glance</> },
		],
	},
	{
		icon: <SlidersHorizontal size={22} />,
		call: "<Playground of={button} />",
		demo: <Playground of={demoButton} />,
		flip: false,
		title: "An interactive playground, for free",
		body: "The same handle drives a live editor: a control for every prop, inferred from its type — dropdowns for unions, toggles for booleans, inputs for strings. No config, no story file.",
		list: [
			{
				id: "controls",
				text: (
					<>
						Controls inferred from each <b>prop type</b>
					</>
				),
			},
			{ id: "live", text: <>The preview updates as you change props</> },
			{
				id: "same",
				text: (
					<>
						Driven by the <b>same handle</b> as the grids
					</>
				),
			},
		],
	},
	{
		icon: <Code2 size={22} />,
		call: "<Snippet>{() => …}</Snippet>",
		demo: (
			<Snippet name="button-group.tsx">
				{() => (
					<div className="flex flex-wrap items-center gap-2.5">
						<DemoButton size="sm">Small</DemoButton>
						<DemoButton size="md" tone="success">
							Save
						</DemoButton>
						<DemoButton variant="outline" tone="danger">
							Delete
						</DemoButton>
						<DemoButton variant="ghost" pill>
							More
						</DemoButton>
					</div>
				)}
			</Snippet>
		),
		flip: true,
		title: "Live examples that show their real source",
		body: "Write a hand-crafted example as an inline component — it renders live. At build time the plugin slices the exact source of its body and injects it, so “Show source” reveals the real code, not a reconstruction.",
		list: [
			{
				id: "real",
				text: (
					<>
						The shown source is your <b>exact code</b>
					</>
				),
			},
			{ id: "hooks", text: <>Use state and hooks inside the example</> },
			{
				id: "norehydrate",
				text: <>No copy-paste drift between demo and code</>,
			},
		],
	},
];

/** Landing "killer features" grid — every demo is a real Typebok widget rendering live. */
export function LandingFeatures() {
	return (
		<section className={SECTION_PAD} id="features">
			<div className={CONTAINER}>
				<SectionHead
					kicker="What you get"
					title="One handle. Four ways to render it."
					sub="Every panel below is the real library running on this page — not a screenshot, not a mockup. The same getComponentMeta() handle drives all four."
				/>
				<div className="flex flex-col gap-24">
					{FEATURES.map((f) => (
						<div
							className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-16 items-center max-[860px]:grid-cols-1 max-[860px]:gap-8 reveal"
							key={f.title}
						>
							<div
								className={cx(
									"max-w-115 max-[860px]:max-w-none",
									f.flip && "min-[861px]:order-2",
								)}
							>
								<div className="w-11.5 h-11.5 rounded-xl grid place-items-center bg-accent-soft text-accent border border-accent-soft-border mb-5">
									{f.icon}
								</div>
								<h3 className="text-[26px] font-[640] tracking-[-0.025em] leading-[1.15] m-0 mb-3">
									{f.title}
								</h3>
								<p className="text-[16px] leading-[1.65] text-fg-muted m-0 mb-4.5 text-pretty">
									{f.body}
								</p>
								<ul className="flex flex-col gap-3.5 m-0 p-0 list-none [&_b]:text-fg [&_b]:font-semibold">
									{f.list.map((li) => (
										<li
											className="flex items-start gap-2.75 text-[14.5px] text-fg-muted leading-[1.45]"
											key={li.id}
										>
											<span className="flex-none mt-0.5 text-accent">
												<Check size={16} />
											</span>
											<span>{li.text}</span>
										</li>
									))}
								</ul>
							</div>
							<div className={cx("min-w-0", f.flip && "min-[861px]:order-1")}>
								<div className="rounded-[14px] border border-border bg-bg-secondary shadow-md overflow-hidden">
									<div className="flex items-center gap-2 h-9.5 px-3.75 border-b border-border bg-bg">
										<span className="flex gap-1.5">
											<i className="w-2.25 h-2.25 rounded-[99px] bg-border-strong not-italic" />
											<i className="w-2.25 h-2.25 rounded-[99px] bg-border-strong not-italic" />
										</span>
										<code className="ml-1 font-mono text-[11.5px] text-fg-muted">
											{f.call}
										</code>
										<span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-fg-subtle">
											<span className="w-1.5 h-1.5 rounded-[99px] bg-[oklch(0.6_0.2_145)] animate-[rec_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
											live
										</span>
									</div>
									<div className="p-5 overflow-x-auto">{f.demo}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
