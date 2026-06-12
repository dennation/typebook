import { type Theme, useTheme } from "@react/entities/theme/index.js";
import styles from "@react/shared/config/styles.css?inline";
import type { ReactNode } from "react";
import { useInsertionEffect } from "react";
import { STYLE_ELEMENT_ID } from "@/constants.js";

export interface LayoutProps {
	children: ReactNode;
	theme?: Theme;
	sidebar?: ReactNode;
}

export function Layout({
	children,
	theme: themeOverride,
	sidebar,
}: LayoutProps) {
	const { theme } = useTheme(themeOverride);

	useInsertionEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return;
		const style = document.createElement("style");
		style.id = STYLE_ELEMENT_ID;
		style.textContent = styles;
		document.head.appendChild(style);
	}, []);

	const rootClass = sidebar
		? "grid grid-cols-[260px_minmax(0,1fr)] h-screen m-0 p-0 box-border font-sans bg-bg text-fg"
		: "h-screen m-0 p-0 box-border font-sans bg-bg text-fg overflow-auto";

	return (
		<div className={rootClass} data-theme={theme}>
			{sidebar}
			<div className={sidebar ? "overflow-auto h-full" : ""}>{children}</div>
		</div>
	);
}
