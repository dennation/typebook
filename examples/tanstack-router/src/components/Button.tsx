import type { ReactNode } from "react";

export interface ButtonProps {
	/** Content rendered inside the button. */
	children: ReactNode;
	/** Visual size of the button. */
	size?: "sm" | "md" | "lg";
	/** Style variant — controls fill and border. */
	variant?: "solid" | "outline" | "ghost";
	/** Semantic color token. */
	color?: "primary" | "secondary" | "danger";
	/** When true, the button is non-interactive and visually dimmed. */
	disabled?: boolean;
	/** Fired on click. Ignored when `disabled` is true. */
	onClick?: () => void;
}

const SIZE: Record<NonNullable<ButtonProps["size"]>, string> = {
	sm: "4px 10px",
	md: "8px 16px",
	lg: "12px 22px",
};

const COLOR: Record<NonNullable<ButtonProps["color"]>, string> = {
	primary: "#2563eb",
	secondary: "#6b7280",
	danger: "#dc2626",
};

export function Button({
	children,
	size = "md",
	variant = "solid",
	color = "primary",
	disabled,
	onClick,
}: ButtonProps) {
	const bg = COLOR[color];
	const style: React.CSSProperties = {
		padding: SIZE[size],
		borderRadius: 6,
		fontSize: 14,
		cursor: disabled ? "not-allowed" : "pointer",
		opacity: disabled ? 0.5 : 1,
		border: variant === "outline" ? `1px solid ${bg}` : "1px solid transparent",
		background: variant === "solid" ? bg : "transparent",
		color: variant === "solid" ? "white" : bg,
	};
	return (
		<button type="button" style={style} disabled={disabled} onClick={onClick}>
			{children}
		</button>
	);
}
