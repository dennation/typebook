import type { ReactNode } from "react";

/** Inline code fragment. Carries `.inline-code` so it styles outside prose too. */
export const InlineCode = ({ children }: { children: ReactNode }) => (
	<code className="inline-code">{children}</code>
);

/** Bold inline text (`<strong>`). */
export const Strong = ({ children }: { children: ReactNode }) => (
	<strong className="font-semibold">{children}</strong>
);

/** Emphasized inline text (`<em>`). */
export const Emphasis = ({ children }: { children: ReactNode }) => (
	<em className="italic">{children}</em>
);

export interface LinkProps {
	href?: string;
	/** In-docs navigation handler; when set the link never hard-navigates. */
	onClick?: () => void;
	children: ReactNode;
}

/** Accent-colored inline link. */
export function Link({ href = "#", onClick, children }: LinkProps) {
	return (
		<a
			className="text-accent font-medium underline [text-decoration-color:var(--accent-soft-border)] [text-underline-offset:3px] hover:[text-decoration-color:var(--accent)] [&_.inline-code]:text-accent"
			href={href}
			onClick={(e) => {
				if (onClick) {
					e.preventDefault();
					onClick();
				} else if (href === "#") {
					e.preventDefault();
				}
			}}
		>
			{children}
		</a>
	);
}
