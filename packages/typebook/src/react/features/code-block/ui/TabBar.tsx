import { tv } from "tailwind-variants";
import type { CodeTab } from "../lib/tabsFromChildren";
import { CopyButton } from "./CopyButton";

const tab = tv({
	base: "relative font-mono text-[12.5px] pt-1.75 px-3 pb-2.25 border-none bg-transparent rounded-t-md transition-colors duration-130",
	variants: {
		on: {
			true: "text-fg",
			false: "text-fg-subtle hover:text-fg-muted",
		},
	},
});

/** The header row: one button per tab + a copy button for the active tab. */
export function TabBar({
	tabs,
	active,
	onSelect,
	code,
}: {
	tabs: CodeTab[];
	active: number;
	onSelect: (index: number) => void;
	code: string;
}) {
	return (
		<div className="flex items-center gap-0.5 pt-1.5 px-2 bg-bg-secondary border-b border-border">
			{tabs.map((t, k) => {
				const on = k === active;
				return (
					<button
						key={`${t.label}-${k}`}
						type="button"
						className={tab({ on })}
						onClick={() => onSelect(k)}
					>
						{t.icon && (
							<span className="inline-flex mr-1.5 opacity-80 [vertical-align:-2px]">
								{t.icon}
							</span>
						)}
						{t.label}
						{on && (
							<span className="absolute left-2 right-2 -bottom-px h-0.5 bg-accent rounded-xs" />
						)}
					</button>
				);
			})}
			<div className="ml-auto">
				<CopyButton code={code} />
			</div>
		</div>
	);
}
