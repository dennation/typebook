import { Icon, type IconProps } from "@dennation/typebook/react";
import type { CSSProperties, ReactNode } from "react";

export type CalloutType = "info" | "warning" | "danger" | "success";

const CALLOUT_ICON: Record<CalloutType, (p: IconProps) => ReactNode> = {
	info: Icon.info,
	warning: Icon.warn,
	danger: Icon.danger,
	success: Icon.ok,
};

const CALLOUT_C: Record<CalloutType, string> = {
	info: "oklch(0.6 0.13 250)",
	warning: "oklch(0.68 0.15 70)",
	danger: "oklch(0.6 0.19 25)",
	success: "oklch(0.6 0.14 155)",
};

export interface CalloutProps {
	type?: CalloutType;
	title?: string;
	children: ReactNode;
}

/** Tinted note block with an intent icon and optional bold title. */
export function Callout({ type = "info", title, children }: CalloutProps) {
	const Ic = CALLOUT_ICON[type];
	return (
		<div
			className="flex gap-[13px] p-[15px_17px] rounded-[var(--radius-token)] text-[14.5px] leading-[1.6] border border-[color-mix(in_oklch,var(--c)_35%,var(--border))] bg-[color-mix(in_oklch,var(--c)_8%,var(--bg))] [&_.inline-code]:bg-bg"
			style={{ "--c": CALLOUT_C[type] } as CSSProperties}
		>
			<span className="shrink-0 mt-[1px] text-[var(--c)] inline-flex">
				<Ic size={19} />
			</span>
			<div className="text-fg-muted min-w-0 [&_strong]:text-fg [&_strong]:block [&_strong]:mb-[2px] [&_strong]:font-semibold">
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
