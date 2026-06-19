import { cx } from "@dennation/typebook/react";
import type { ReactNode } from "react";

export interface SidebarShellProps {
	/** Mobile drawer state. */
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

const aside =
	"sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-6 pr-3.5 pb-15 pl-5.5 border-r border-border max-[820px]:fixed max-[820px]:top-14 max-[820px]:left-0 max-[820px]:z-45 max-[820px]:w-72.5 max-[820px]:bg-bg max-[820px]:border-r-0 max-[820px]:shadow-lg max-[820px]:transition-transform max-[820px]:duration-240";

/** The sidebar frame: sticky aside on desktop, slide-in drawer + overlay on mobile. */
export function SidebarShell({ open, onClose, children }: SidebarShellProps) {
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
					aside,
					open
						? "max-[820px]:translate-x-0"
						: "max-[820px]:-translate-x-[102%]",
				)}
			>
				{children}
			</aside>
		</>
	);
}
