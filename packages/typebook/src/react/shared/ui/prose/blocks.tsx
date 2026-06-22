import type { ReactNode } from "react";

/** Vertical rhythm between blocks; `first:mt-0` mirrors the old `* + *` rule. */
const BLOCK_GAP = "mt-[calc(18px*var(--density))] first:mt-0";

/** Lead paragraph rendered under the page title. */
export const Lead = ({ children }: { children: ReactNode }) => (
	<p className="text-[17px] leading-[1.6] text-fg-muted m-0 mb-2 text-pretty">
		{children}
	</p>
);

/** Body paragraph. */
export const Paragraph = ({ children }: { children: ReactNode }) => (
	<p className={`${BLOCK_GAP} text-fg text-pretty`}>{children}</p>
);

/** Ordered or unordered list. `ordered` switches `<ul>`→`<ol>` and the marker. */
export function List({
	ordered = false,
	children,
}: {
	/** Render an `<ol>` with numbers instead of a `<ul>` with dashes. @default false */
	ordered?: boolean;
	children: ReactNode;
}) {
	const base = `${BLOCK_GAP} pl-6 flex flex-col gap-[7px]`;
	return ordered ? (
		<ol className={base}>{children}</ol>
	) : (
		<ul className={`${base} [&>li]:marker:content-['–__']`}>{children}</ul>
	);
}

/** List item; the dash/number marker comes from the parent `List`. */
export const ListItem = ({ children }: { children: ReactNode }) => (
	<li className="pl-1 marker:text-fg-subtle">{children}</li>
);

/** Accent-tinted pull quote. */
export const Blockquote = ({ children }: { children: ReactNode }) => (
	<blockquote
		className={`${BLOCK_GAP} pl-4.5 py-1 border-l-3 border-accent-soft-border text-fg-muted italic text-[15.5px]`}
	>
		{children}
	</blockquote>
);

/** Thematic break between sections. */
export const Divider = () => (
	<hr className="border-0 border-t border-border my-[calc(40px*var(--density))]" />
);
