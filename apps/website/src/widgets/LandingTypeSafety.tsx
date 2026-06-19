import { cx } from "@dennation/typebook/react";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";

const Squiggle = ({ children }: { children: ReactNode }) => (
	<span className="bg-[linear-gradient(var(--err),var(--err))] [background-size:100%_2px] [background-position:0_100%] [background-repeat:repeat-x] [--err:oklch(0.62_0.2_25)]">
		{children}
	</span>
);

const CARDS = [
	{
		title: "Typos can't compile",
		desc: (
			<>
				<code className="text-fg">allOf()</code> is typed against the
				component's real props — a misspelled prop name is a build error, not a
				silently empty grid.
			</>
		),
		code: (
			<>
				<span className="text-fg-subtle">
					{'// ✗ "siz" is not a prop of Button'}
				</span>
				{"\n"}
				<span className="text-accent">allOf</span>
				{"(button, "}
				<Squiggle>
					<span className="[color:oklch(0.7_0.14_140)]">"siz"</span>
				</Squiggle>
				{")"}
			</>
		),
		err: "Argument of type '\"siz\"' is not assignable to parameter of type 'keyof DemoButtonProps'.",
	},
	{
		title: "Required props can't be forgotten",
		desc: (
			<>
				A <code className="text-fg">{"<Story>"}</code> won't type-check until
				every required prop is covered — by{" "}
				<code className="text-fg">defaultProps</code> or at the call site.
			</>
		),
		code: (
			<>
				<span className="text-fg-subtle">{"// ✗ children is required"}</span>
				{"\n"}
				{"<"}
				<Squiggle>
					<span className="[color:oklch(0.65_0.16_30)]">Story</span>
				</Squiggle>
				{" of={button} />"}
			</>
		),
		err: "Property 'props' is missing but required: children is not covered by defaultProps.",
	},
];

/** Type-safety band: the authoring API catches mistakes at compile time. */
export function LandingTypeSafety() {
	return (
		<section className={cx(SECTION_PAD, "pt-0")} id="type-safe">
			<div className={CONTAINER}>
				<SectionHead
					kicker="Type-safe by construction"
					title="The compiler has your back"
					sub="Stories, axes and variant lists are all checked against your component's actual props. Mistakes surface in your editor — long before they reach a reader."
				/>
				<div className="grid grid-cols-2 gap-5 max-[860px]:grid-cols-1">
					{CARDS.map((c) => (
						<div
							key={c.title}
							className="reveal rounded-[14px] border border-border bg-bg overflow-hidden flex flex-col"
						>
							<div className="p-5.5 pb-4">
								<div className="w-10 h-10 rounded-[10px] grid place-items-center bg-accent-soft text-accent border border-accent-soft-border mb-4">
									<ShieldCheck size={19} />
								</div>
								<h3 className="text-[18px] font-[640] tracking-[-0.02em] m-0 mb-2">
									{c.title}
								</h3>
								<p className="text-[14px] leading-[1.6] text-fg-muted m-0">
									{c.desc}
								</p>
							</div>
							<div className="mt-auto border-t border-border bg-bg-secondary">
								<pre className="m-0 px-5 py-4 font-mono text-[13px] leading-[1.7] text-fg whitespace-pre overflow-x-auto">
									{c.code}
								</pre>
								<div className="flex items-start gap-2 px-5 py-3 border-t border-border text-[12px] leading-[1.5] [color:oklch(0.6_0.18_25)]">
									<TriangleAlert size={14} className="shrink-0 mt-0.5" />
									<span className="font-mono">{c.err}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
