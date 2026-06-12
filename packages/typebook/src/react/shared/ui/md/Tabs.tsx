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
			<div className="flex gap-1 border-b border-border mb-4" role="tablist">
				{tabs.map((t, i) => {
					const on = i === active;
					return (
						<button
							key={t.label}
							type="button"
							role="tab"
							aria-selected={on}
							className={`text-[13.5px] font-medium px-1 py-2 -mb-px bg-transparent border-0 border-b-2 transition-colors duration-130 ${on ? "text-fg border-accent" : "text-fg-muted border-transparent hover:text-fg"}`}
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
