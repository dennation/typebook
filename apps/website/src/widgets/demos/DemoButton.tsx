import type { ReactNode } from "react";

/**
 * A small button used across the landing page's live Typebok demos.
 *
 * Its props are intentionally rich — literal unions and a boolean — so the
 * `typebook()` plugin extracts a varied {@link DemoButtonProps} shape and the
 * `<Variants>` / `<Matrix>` / `<Playground>` widgets have real axes to render.
 * It is a plain demo component, styled with the site's design tokens.
 */
export interface DemoButtonProps {
	/** Content rendered inside the button. */
	children: ReactNode;
	/** Visual size — controls padding and font size. */
	size?: "sm" | "md" | "lg";
	/** Fill style — how much surface the button paints. */
	variant?: "solid" | "soft" | "outline" | "ghost";
	/** Semantic color the button speaks in. */
	tone?: "accent" | "neutral" | "danger" | "success";
	/** Pill-shaped corners instead of the default radius. */
	pill?: boolean;
	/** Dim and disable the button. */
	disabled?: boolean;
}

const SIZE: Record<NonNullable<DemoButtonProps["size"]>, string> = {
	sm: "h-7 px-2.75 text-[12px] gap-1",
	md: "h-9 px-3.75 text-[13px] gap-1.5",
	lg: "h-11 px-5 text-[14.5px] gap-2",
};

// Each tone maps to an OKLCH hue used for both fill and text variants.
const TONE: Record<NonNullable<DemoButtonProps["tone"]>, string> = {
	accent: "var(--accent-h)",
	neutral: "var(--neutral-h, 264)",
	danger: "25",
	success: "150",
};

/** A demo button rendered by the landing's live Typebok widgets. */
export function DemoButton({
	children,
	size = "md",
	variant = "solid",
	tone = "accent",
	pill,
	disabled,
}: DemoButtonProps) {
	const h = TONE[tone];
	const solidBg = tone === "accent" ? "var(--accent)" : `oklch(0.62 0.17 ${h})`;
	const fg = `oklch(0.62 0.17 ${h})`;

	const base: Record<typeof variant, React.CSSProperties> = {
		solid: {
			background: solidBg,
			color: "white",
			border: "1px solid transparent",
		},
		soft: {
			background: `color-mix(in oklch, ${solidBg} 16%, transparent)`,
			color: fg,
			border: "1px solid transparent",
		},
		outline: {
			background: "transparent",
			color: fg,
			border: `1px solid color-mix(in oklch, ${fg} 45%, transparent)`,
		},
		ghost: {
			background: "transparent",
			color: fg,
			border: "1px solid transparent",
		},
	};

	return (
		<button
			type="button"
			disabled={disabled}
			className={`inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors ${SIZE[size]}`}
			style={{
				...base[variant],
				borderRadius: pill ? 999 : 8,
				cursor: disabled ? "not-allowed" : "pointer",
				opacity: disabled ? 0.45 : 1,
			}}
		>
			{children}
		</button>
	);
}
