import { Icon, type IconProps } from "@react/shared/ui/icon/index.js";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

export type CalloutType = "info" | "warning" | "danger" | "success";

const CALLOUT_ICON: Record<CalloutType, (p: IconProps) => ReactNode> = {
	info: Icon.info,
	warning: Icon.warn,
	danger: Icon.danger,
	success: Icon.ok,
};

const callout = tv({
	slots: {
		root: "flex gap-3.25 p-[15px_17px] rounded-(--radius-token) text-[14.5px] leading-[1.6] border border-[color-mix(in_oklch,var(--c)_35%,var(--border))] bg-[color-mix(in_oklch,var(--c)_8%,var(--bg))] [&_.inline-code]:bg-bg",
		icon: "shrink-0 mt-px text-(--c) inline-flex",
		body: "text-fg-muted min-w-0 [&_strong]:text-fg [&_strong]:block [&_strong]:mb-0.5 [&_strong]:font-semibold",
	},
	variants: {
		type: {
			info: { root: "[--c:oklch(0.6_0.13_250)]" },
			warning: { root: "[--c:oklch(0.68_0.15_70)]" },
			danger: { root: "[--c:oklch(0.6_0.19_25)]" },
			success: { root: "[--c:oklch(0.6_0.14_155)]" },
		},
	},
	defaultVariants: { type: "info" },
});

export interface CalloutProps {
	/**
	 * Visual intent. Controls the border, background tint and icon.
	 * @default "info"
	 */
	type?: CalloutType;
	/** Optional bold heading rendered above the body. */
	title?: string;
	/** Body content. A plain string is wrapped in a paragraph; rich children render as-is. */
	children: ReactNode;
}

/** Tinted note block with an intent icon and optional bold title. */
export function Callout({ type = "info", title, children }: CalloutProps) {
	const Ic = CALLOUT_ICON[type];
	const { root, icon, body } = callout({ type });
	return (
		<div className={root()}>
			<span className={icon()}>

				<Ic size={19} />
			</span>
			<div className={body()}>
				{title && <strong>{title}</strong>}
				{typeof children === "string" ? (
					<p className="m-0">{children}</p>
				) : (
					children
				)}
			</div>
		</div>
	);
}
