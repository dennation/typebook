import type { ReactNode } from "react";

/** Plain paragraph — typography comes from the `.doc-prose` theme layer. */
export const P = ({ children }: { children: ReactNode }) => <p>{children}</p>;

/** Lead paragraph rendered under the page title. */
export const Lead = ({ children }: { children: ReactNode }) => (
	<p className="text-[17px] leading-[1.6] text-fg-muted m-0 mb-2 text-pretty">
		{children}
	</p>
);

/** Inline code. */
export const C = ({ children }: { children: ReactNode }) => (
	<code className="inline-code">{children}</code>
);

export interface AProps {
	href?: string;
	/** In-docs navigation handler; when set the link never hard-navigates. */
	onClick?: () => void;
	children: ReactNode;
}

/** Accent-colored inline link. */
export function A({ href = "#", onClick, children }: AProps) {
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

export const Ul = ({ children }: { children: ReactNode }) => (
	<ul>{children}</ul>
);
export const Ol = ({ children }: { children: ReactNode }) => (
	<ol>{children}</ol>
);
export const Li = ({ children }: { children: ReactNode }) => (
	<li>{children}</li>
);

export const Hr = () => (
	<hr className="border-0 border-t border-border my-[calc(40px*var(--density))]" />
);

export const Quote = ({ children }: { children: ReactNode }) => (
	<blockquote className="border-l-3 border-accent-soft-border pl-4.5 py-1 m-0 text-fg-muted italic text-[15.5px]">
		{children}
	</blockquote>
);

/** Hatched placeholder used where the docs would show a screenshot. */
export function ImgPlaceholder({
	label = "screenshot",
	height,
}: {
	label?: string;
	height?: number;
}) {
	return (
		<div
			className="border border-border rounded-(--radius-token) bg-bg-secondary bg-[repeating-linear-gradient(135deg,transparent_0_11px,color-mix(in_oklch,var(--border)_55%,transparent)_11px_12px)] h-55 grid place-items-center"
			style={height ? { height } : undefined}
		>
			<span className="font-mono text-[12px] text-fg-subtle bg-bg px-2.75 py-1.25 rounded-[99px] border border-border">
				{label}
			</span>
		</div>
	);
}
