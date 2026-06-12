import { cx, Icon } from "@dennation/typebook/react";
import { useState } from "react";
import { type DocsNavSection, NAV } from "../../entities/docs/nav.js";
import type { DocsGo } from "./go.js";

export interface DocsSidebarProps {
	current: string;
	go: DocsGo;
	open: boolean;
	onClose: () => void;
}

/** Left navigation: collapsible sections, active page highlight, mobile drawer. */
export function DocsSidebar({ current, go, open, onClose }: DocsSidebarProps) {
	return (
		<>
			<div
				className={cx(
					"hidden",
					open &&
						"max-[820px]:block fixed inset-[56px_0_0] z-[44] bg-[oklch(0.2_0.02_270/0.4)]",
				)}
				onClick={onClose}
				aria-hidden="true"
			/>
			<aside
				className={cx(
					"sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto pt-[24px] pr-[14px] pb-[60px] pl-[22px] border-r border-border",
					"max-[820px]:fixed max-[820px]:top-[56px] max-[820px]:left-0 max-[820px]:z-[45] max-[820px]:w-[290px] max-[820px]:bg-bg max-[820px]:border-r-0 max-[820px]:shadow-lg max-[820px]:transition-transform max-[820px]:duration-[240ms]",
					open
						? "max-[820px]:translate-x-0"
						: "max-[820px]:-translate-x-[102%]",
				)}
			>
				{NAV.map((sec) => (
					<SidebarSection key={sec.label} sec={sec} current={current} go={go} />
				))}
			</aside>
		</>
	);
}

function SidebarSection({
	sec,
	current,
	go,
}: {
	sec: DocsNavSection;
	current: string;
	go: DocsGo;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const Ic = Icon[sec.icon];
	return (
		<div className="mb-[22px]">
			<button
				type="button"
				className="flex items-center gap-[8px] text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-subtle px-[10px] py-[6px] mb-[2px] w-full text-left bg-transparent border-none"
				onClick={() => setCollapsed(!collapsed)}
			>
				<span className="text-fg-muted inline-flex">
					<Ic size={14} />
				</span>
				{sec.label}
				<span
					className={cx(
						"ml-auto transition-transform duration-[180ms] opacity-70",
						collapsed && "-rotate-90",
					)}
				>
					<Icon.chevD size={14} />
				</span>
			</button>
			{!collapsed && (
				<div className="flex flex-col gap-[1px] overflow-hidden">
					{sec.items.map((it) => {
						const active = it.slug === current;
						return (
							<button
								key={it.slug}
								type="button"
								className={cx(
									"relative flex items-center gap-[9px] text-[13.5px] px-[10px] py-[6px] rounded-[7px] w-full text-left bg-transparent border-none transition-colors duration-[130ms]",
									active
										? "text-accent bg-accent-soft font-medium"
										: "text-fg-muted font-[450] hover:text-fg hover:bg-bg-tertiary",
								)}
								onClick={() => go(it.slug)}
							>
								<span
									className={cx(
										"w-[5px] h-[5px] rounded-[99px] bg-current shrink-0 ml-[4px]",
										active ? "opacity-100" : "opacity-30",
									)}
								/>
								{it.title}
								{it.badge === "new" && (
									<span className="ml-auto text-[10px] font-mono px-[6px] py-[1px] rounded-[99px] font-medium bg-accent-soft text-accent border border-accent-soft-border">
										new
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
