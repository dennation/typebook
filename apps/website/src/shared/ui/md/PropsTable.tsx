import type { ReactNode } from "react";

export interface PropRowData {
	name: string;
	type: string;
	required?: boolean;
	default?: string;
	desc: ReactNode;
}

export interface PropsTableProps {
	props: PropRowData[];
}

/** Component API table — one striped row per prop. */
export function PropsTable({ props }: PropsTableProps) {
	return (
		<div className="flex flex-col border border-border rounded-[var(--radius-token)] overflow-hidden">
			{props.map((p) => (
				<div
					className="grid grid-cols-1 px-[18px] py-[16px] border-b border-border last:border-b-0 even:bg-bg-secondary"
					key={p.name}
				>
					<div className="flex items-center gap-[10px] flex-wrap mb-[6px]">
						<span className="font-mono text-[13.5px] font-semibold text-fg">
							{p.name}
						</span>
						{p.required && (
							<span className="text-[10px] font-semibold tracking-[0.04em] uppercase text-[oklch(0.6_0.19_25)] bg-[color-mix(in_oklch,oklch(0.6_0.19_25)_12%,var(--bg))] px-[6px] py-[2px] rounded-[99px]">
								Required
							</span>
						)}
						<span className="font-mono text-[12.5px] text-accent bg-accent-soft px-[7px] py-[2px] rounded-[5px] border border-accent-soft-border">
							{p.type}
						</span>
						{p.default !== undefined && (
							<span className="ml-auto font-mono text-[12px] text-fg-subtle [&>b]:text-fg-muted [&>b]:font-medium">
								default <b>{p.default}</b>
							</span>
						)}
					</div>
					<div className="text-[14px] text-fg-muted leading-[1.55] [&_.inline-code]:text-[12px]">
						{p.desc}
					</div>
				</div>
			))}
		</div>
	);
}
