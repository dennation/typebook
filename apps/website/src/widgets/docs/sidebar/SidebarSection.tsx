import { cx, Icon } from "@dennation/typebook/react";
import { type ReactNode, useState } from "react";

export interface SidebarSectionProps {
	/** Leading icon next to the section label. */
	icon: ReactNode;
	/** Uppercase section heading. */
	label: string;
	/** The section's menu (a `<Menu>` of links). */
	children: ReactNode;
}

/** A collapsible sidebar section: icon + label header over its menu. */
export function SidebarSection({ icon, label, children }: SidebarSectionProps) {
	const [collapsed, setCollapsed] = useState(false);
	return (
		<div className="mb-5.5">
			<button
				type="button"
				className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-subtle px-2.5 py-1.5 mb-0.5 w-full text-left bg-transparent border-none"
				onClick={() => setCollapsed(!collapsed)}
			>
				<span className="text-fg-muted inline-flex">{icon}</span>
				{label}
				<span
					className={cx(
						"ml-auto transition-transform duration-180 opacity-70",
						collapsed && "-rotate-90",
					)}
				>
					<Icon.chevD size={14} />
				</span>
			</button>
			{!collapsed && children}
		</div>
	);
}
