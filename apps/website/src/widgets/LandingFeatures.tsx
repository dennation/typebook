import { cx, Icon } from "@dennation/typebook/react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout.js";
import { SectionHead } from "../shared/ui/SectionHead.js";
import { DemoMdx } from "./demos/DemoMdx.js";
import { DemoSearch } from "./demos/DemoSearch.js";
import { DemoTheme } from "./demos/DemoTheme.js";
import { DemoTree } from "./demos/DemoTree.js";

interface Feature {
	icon: ReactNode;
	demo: ReactNode;
	flip: boolean;
	title: string;
	body: string;
	list: { id: string; text: ReactNode }[];
}

const FEATURES: Feature[] = [
	{
		icon: <Icon.search size={22} />,
		demo: <DemoSearch />,
		flip: false,
		title: "Search that ships on day one",
		body: "A command palette indexes every heading and paragraph at build time. No Algolia account, no runtime service, no monthly bill — just ⌘K.",
		list: [
			{
				id: "fuzzy",
				text: (
					<>
						Fuzzy matches <b>titles, sections and prose</b>
					</>
				),
			},
			{
				id: "keyboard",
				text: (
					<>
						Keyboard-driven, <b>zero</b> third-party JS
					</>
				),
			},
			{ id: "offline", text: <>Works offline and in static exports</> },
		],
	},
	{
		icon: <Icon.layers size={22} />,
		demo: <DemoTree />,
		flip: true,
		title: "Your folders are the navigation",
		body: "Drop Markdown files into directories and the sidebar builds itself. A tiny meta.json sets order, labels and icons when you want control.",
		list: [
			{
				id: "folders",
				text: (
					<>
						Folders become <b>groups</b>, files become <b>pages</b>
					</>
				),
			},
			{ id: "no-config", text: <>No route config, no manual nav arrays</> },
			{
				id: "reorder",
				text: (
					<>
						Reorder with one <b>meta.json</b>
					</>
				),
			},
		],
	},
	{
		icon: <Icon.palette size={22} />,
		demo: <DemoTheme />,
		flip: false,
		title: "Themeable down to the token",
		body: "Every color, radius and font is a CSS variable. Change the accent, restyle a single component, or override the whole system from one stylesheet. Dark mode is built in.",
		list: [
			{
				id: "dark-mode",
				text: (
					<>
						System-aware <b>dark mode</b>, zero setup
					</>
				),
			},
			{
				id: "recolor",
				text: (
					<>
						Recolor with <b>one</b> CSS variable
					</>
				),
			},
			{ id: "restyle", text: <>Restyle any component freely</> },
		],
	},
	{
		icon: <Icon.box size={22} />,
		demo: <DemoMdx />,
		flip: true,
		title: "Rich components, plain Markdown",
		body: "Callouts, tabs, steps, props tables and cards ship ready to use. Write them as MDX, or use GitHub-flavored shorthand — both compile to the same polished output.",
		list: [
			{
				id: "components",
				text: (
					<>
						Callouts, tabs, steps, cards & <b>props tables</b>
					</>
				),
			},
			{ id: "code", text: <>Highlighted code with copy & line marks</> },
			{
				id: "shorthand",
				text: (
					<>
						Components or <b>{"> [!NOTE]"}</b> shorthand
					</>
				),
			},
		],
	},
];

/** Landing "Why Typebok" feature grid with looping demos. */
export function LandingFeatures() {
	return (
		<section className={SECTION_PAD} id="features">
			<div className={CONTAINER}>
				<SectionHead
					kicker="Why Typebok"
					title="Everything a docs site needs, nothing it doesn't"
					sub="The polish you'd build by hand — search, navigation, theming and components — working out of the box, on top of files you already understand."
				/>
				<div className="flex flex-col gap-[96px]">
					{FEATURES.map((f) => (
						<div
							className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[64px] items-center max-[860px]:grid-cols-1 max-[860px]:gap-[32px] reveal"
							key={f.title}
						>
							<div
								className={cx(
									"max-w-[460px] max-[860px]:max-w-none",
									f.flip && "min-[861px]:order-2",
								)}
							>
								<div className="w-[46px] h-[46px] rounded-[12px] grid place-items-center bg-accent-soft text-accent border border-accent-soft-border mb-[20px]">
									{f.icon}
								</div>
								<h3 className="text-[26px] font-[640] tracking-[-0.025em] leading-[1.15] m-0 mb-[12px]">
									{f.title}
								</h3>
								<p className="text-[16px] leading-[1.65] text-fg-muted m-0 mb-[18px] [text-wrap:pretty]">
									{f.body}
								</p>
								<ul className="flex flex-col gap-[14px] m-0 p-0 list-none [&_b]:text-fg [&_b]:font-semibold">
									{f.list.map((li) => (
										<li
											className="flex items-start gap-[11px] text-[14.5px] text-fg-muted leading-[1.45]"
											key={li.id}
										>
											<span className="flex-none mt-[2px] text-accent">
												<Icon.check size={16} />
											</span>
											<span>{li.text}</span>
										</li>
									))}
								</ul>
							</div>
							<div className={cx("min-w-0", f.flip && "min-[861px]:order-1")}>
								{f.demo}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
