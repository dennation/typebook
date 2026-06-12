import { cx } from "@react/shared/lib/cx.js";
import { Icon } from "@react/shared/ui/icon/index.js";
import { useState } from "react";
import type { DocsNavSection } from "../model/types.js";

export interface DocsSidebarProps {
	/** Navigation sections to render. */
	sections: DocsNavSection[];
	/** Slug of the currently open page. */
	current: string;
	onNavigate: (slug: string) => void;
	/** Mobile drawer state. */
	open: boolean;
	onClose: () => void;
}

/** Left navigation: collapsible sections, active page highlight, mobile drawer. */
export function DocsSidebar({
	sections,
	current,
	onNavigate,
	open,
	onClose,
}: DocsSidebarProps) {
	return (
		<>
			<div
				className={cx(
					"hidden",
					open &&
						"max-[820px]:block fixed inset-[56px_0_0] z-44 bg-[oklch(0.2_0.02_270/0.4)]",
				)}
				onClick={onClose}
				aria-hidden="true"
			/>
			<aside
				className={cx(
					"sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-6 pr-3.5 pb-15 pl-5.5 border-r border-border",
					"max-[820px]:fixed max-[820px]:top-14 max-[820px]:left-0 max-[820px]:z-45 max-[820px]:w-72.5 max-[820px]:bg-bg max-[820px]:border-r-0 max-[820px]:shadow-lg max-[820px]:transition-transform max-[820px]:duration-240",
					open
						? "max-[820px]:translate-x-0"
						: "max-[820px]:-translate-x-[102%]",
				)}
			>
				{sections.map((sec) => (
					<SidebarSection
						key={sec.label}
						sec={sec}
						current={current}
						onNavigate={onNavigate}
					/>
				))}
			</aside>
		</>
	);
}

function SidebarSection({
	sec,
	current,
	onNavigate,
}: {
	sec: DocsNavSection;
	current: string;
	onNavigate: (slug: string) => void;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const Ic = Icon[sec.icon];
	return (
		<div className="mb-5.5">
			<button
				type="button"
				className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase text-fg-subtle px-2.5 py-1.5 mb-0.5 w-full text-left bg-transparent border-none"
				onClick={() => setCollapsed(!collapsed)}
			>
				<span className="text-fg-muted inline-flex">
					<Ic size={14} />
				</span>
				{sec.label}
				<span
					className={cx(
						"ml-auto transition-transform duration-180 opacity-70",
						collapsed && "-rotate-90",
					)}
				>
					<Icon.chevD size={14} />
				</span>
			</button>
			{!collapsed && (
				<div className="flex flex-col gap-px overflow-hidden">
					{sec.items.map((it) => {
						const active = it.slug === current;
						return (
							<button
								key={it.slug}
								type="button"
								className={cx(
									"relative flex items-center gap-2.25 text-[13.5px] px-2.5 py-1.5 rounded-[7px] w-full text-left bg-transparent border-none transition-colors duration-130",
									active
										? "text-accent bg-accent-soft font-medium"
										: "text-fg-muted font-[450] hover:text-fg hover:bg-bg-tertiary",
								)}
								onClick={() => onNavigate(it.slug)}
							>
								<span
									className={cx(
										"w-1.25 h-1.25 rounded-[99px] bg-current shrink-0 ml-1",
										active ? "opacity-100" : "opacity-30",
									)}
								/>
								{it.title}
								{it.badge === "new" && (
									<span className="ml-auto text-[10px] font-mono px-1.5 py-px rounded-[99px] font-medium bg-accent-soft text-accent border border-accent-soft-border">
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
