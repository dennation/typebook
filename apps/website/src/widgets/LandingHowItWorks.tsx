import { CodeBlock, cx } from "@dennation/typebook/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { CONTAINER, SECTION_PAD } from "../shared/lib/landingLayout";
import { SectionHead } from "../shared/ui/SectionHead";

interface Step {
	n: string;
	title: string;
	body: ReactNode;
	code: string;
}

const STEPS: Step[] = [
	{
		n: "01",
		title: "Write your component",
		body: (
			<>
				Just a normal React component with typed props. The union types you
				already write <b>are</b> the variants.
			</>
		),
		code: `interface ButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
  disabled?: boolean;
}

export function Button(p: ButtonProps) { … }`,
	},
	{
		n: "02",
		title: "Register it once",
		body: (
			<>
				One call returns a self-contained handle. No registry, no string ids, no
				provider to wire.
			</>
		),
		code: `import { getComponentMeta }
  from "@dennation/typebook/react";

const button = getComponentMeta(Button);`,
	},
	{
		n: "03",
		title: "Render anything",
		body: (
			<>
				Stories, variant grids, matrices and an interactive playground — all
				from that one handle.
			</>
		),
		code: `<Story    of={button} />
<Variants of={button} items={allOf(button,"size")} />
<Matrix   of={button} x={…} y={[…]} />
<Playground of={button} />`,
	},
];

/** "How it works" — the build-time injection explained in three steps. */
export function LandingHowItWorks() {
	return (
		<section className={cx(SECTION_PAD, "pb-0")} id="how">
			<div className={CONTAINER}>
				<SectionHead
					kicker="How it works"
					title="Your types are the source of truth"
					sub="No .stories files, no fixtures, no duplicated prop lists. The bundler plugin reads your component's types through the TypeScript compiler and injects them where you use them."
				/>
				<div className="grid grid-cols-3 gap-5 max-[860px]:grid-cols-1">
					{STEPS.map((s) => (
						<div
							key={s.n}
							className="reveal flex flex-col rounded-[14px] border border-border bg-bg overflow-hidden"
						>
							<div className="p-5.5 pb-4">
								<div className="font-mono text-[12px] font-semibold text-accent mb-2.5">
									{s.n}
								</div>
								<h3 className="text-[18px] font-[640] tracking-[-0.02em] m-0 mb-2">
									{s.title}
								</h3>
								<p className="text-[14px] leading-[1.6] text-fg-muted m-0 [&_b]:text-fg [&_b]:font-semibold">
									{s.body}
								</p>
							</div>
							<div className="mt-auto border-t border-border text-[12px] [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
								<CodeBlock code={s.code} lang="tsx" />
							</div>
						</div>
					))}
				</div>

				{/* The injection itself: authored → built. */}
				<div className="reveal mt-7 rounded-[14px] border border-accent-soft-border bg-accent-soft/40 overflow-hidden">
					<div className="px-5.5 py-3.5 border-b border-accent-soft-border flex items-center gap-2 text-[12.5px] text-fg-muted">
						<span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[99px] bg-accent-soft text-accent border border-accent-soft-border">
							build time
						</span>
						The plugin rewrites the call in place — props become a static
						literal, with <b className="text-fg font-semibold">zero runtime</b>{" "}
						reflection.
					</div>
					<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0 max-[860px]:grid-cols-1">
						<div className="text-[12px] [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
							<div className="px-4 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
								you write
							</div>
							<CodeBlock code={`getComponentMeta(Button);`} lang="tsx" />
						</div>
						<div className="grid place-items-center text-fg-subtle px-2 py-3 max-[860px]:rotate-90">
							<ArrowRight size={18} />
						</div>
						<div className="text-[12px] border-l border-accent-soft-border max-[860px]:border-l-0 max-[860px]:border-t [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0">
							<div className="px-4 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
								the bundler emits
							</div>
							<CodeBlock
								code={`getComponentMeta(Button, { __props: [
  { name: "size", type: { kind: "literal",
    values: ["sm","md","lg"] } },
  { name: "variant", type: { kind: "literal",
    values: ["solid","ghost"] } },
  { name: "disabled", type: { kind: "boolean" } },
]});`}
								lang="tsx"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
