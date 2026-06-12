import { type ReactNode, useState } from "react";

export interface TabItem {
	label: string;
	content: ReactNode;
}

export interface TabsProps {
	tabs: TabItem[];
}

/** Underline-style content tabs. */
export function Tabs({ tabs }: TabsProps) {
	const [active, setActive] = useState(0);
	return (
		<div>
			<div
				className="flex gap-[4px] border-b border-border mb-[16px]"
				role="tablist"
			>
				{tabs.map((t, i) => {
					const on = i === active;
					return (
						<button
							key={t.label}
							type="button"
							role="tab"
							aria-selected={on}
							className={`text-[13.5px] font-medium px-[4px] py-[8px] mb-[-1px] bg-transparent border-0 border-b-2 transition-colors duration-[130ms] ${on ? "text-fg border-accent" : "text-fg-muted border-transparent hover:text-fg"}`}
							onClick={() => setActive(i)}
						>
							{t.label}
						</button>
					);
				})}
			</div>
			<div role="tabpanel">{tabs[active]?.content}</div>
		</div>
	);
}
