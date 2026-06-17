import { type Theme, useTheme } from "@react/entities/theme/index.js";
import styles from "@react/shared/config/styles.css?inline";
import type { ReactNode } from "react";
import { useInsertionEffect } from "react";
import { tv } from "tailwind-variants";
import { STYLE_ELEMENT_ID } from "@/constants.js";

const layout = tv({
	slots: {
		root: "h-screen m-0 p-0 box-border font-sans bg-bg text-fg",
		content: "",
	},
	variants: {
		withSidebar: {
			true: {
				root: "grid grid-cols-[260px_minmax(0,1fr)]",
				content: "overflow-auto h-full",
			},
			false: {
				root: "overflow-auto",
			},
		},
	},
	defaultVariants: { withSidebar: false },
});

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

	const { root, content } = layout({ withSidebar: Boolean(sidebar) });

	return (
		<div className={root()} data-theme={theme}>
			{sidebar}
			<div className={content()}>{children}</div>
		</div>
	);
}
