import { type ReactNode, useState } from "react";
import { tv } from "tailwind-variants";

const tab = tv({
	base: "text-[13.5px] font-medium px-1 py-2 -mb-px bg-transparent border-0 border-b-2 transition-colors duration-130",
	variants: {
		active: {
			true: "text-fg border-accent",
			false: "text-fg-muted border-transparent hover:text-fg",
		},
	},
});

export interface TabItem {
	label: string;
	content: ReactNode;
}

export interface TabsProps {
	/** Panels to switch between: { label: string, content: ReactNode }. Labels double as keys, so keep them unique. */
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
							className={tab({ active: on })}
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
