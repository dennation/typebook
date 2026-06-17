import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	ReactNode,
} from "react";
import { cx } from "../../lib/cx.js";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
	"group inline-flex items-center justify-center gap-2 font-sans font-medium rounded-(--radius-token) border border-transparent whitespace-nowrap transition-all duration-140 active:translate-y-px";

const VARIANTS: Record<ButtonVariant, string> = {
	primary:
		"bg-accent text-accent-fg shadow-sm hover:bg-accent-hover hover:shadow-md",
	ghost: "text-fg-muted hover:text-fg hover:bg-bg-tertiary",
};

const SIZES: Record<ButtonSize, string> = {
	sm: "h-9 text-[13.5px] px-3.5",
	md: "h-10.5 text-[14.5px] px-4.25",
	lg: "h-12.5 text-[15.5px] px-6 rounded-[calc(var(--radius-token)+2px)]",
};

/** Class applied to a trailing chevron so it nudges right on hover. */
export const ARROW_CLASS =
	"transition-transform duration-160 group-hover:translate-x-[3px]";

/** Compose the button class string for use on a raw element. */
export function buttonClass(
	variant: ButtonVariant = "primary",
	size: ButtonSize = "md",
	extra?: string,
): string {
	return cx(BASE, VARIANTS[variant], SIZES[size], extra);
}

type CommonProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children?: ReactNode;
};

type ButtonAsButton = CommonProps & { as?: "button" } & Omit<
		ButtonHTMLAttributes<HTMLButtonElement>,
		"children"
	>;
type ButtonAsAnchor = CommonProps & { as: "a" } & Omit<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		"children"
	>;

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/** Primary call-to-action button, optionally rendered as an anchor (`as="a"`). */
export function Button(props: ButtonProps) {
	const {
		variant = "primary",
		size = "md",
		className,
		children,
		...rest
	} = props as CommonProps & {
		className?: string;
		as?: "a" | "button";
	} & Record<string, unknown>;
	const cls = buttonClass(variant, size, className);

	if (props.as === "a") {
		const { as: _as, ...anchorRest } = rest;
		return (
			<a
				className={cls}
				{...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{children}
			</a>
		);
	}
	const { as: _as, ...buttonRest } = rest;
	return (
		<button
			className={cls}
			{...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
		</button>
	);
}
