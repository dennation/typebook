import { childText } from "@react/shared/lib/childText";
import { slugify } from "@react/shared/lib/slugify";
import { Hash } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const anchor = tv({
	base: "opacity-0 group-hover:opacity-100 text-fg-subtle transition-opacity duration-140 font-normal",
});

/** Section heading. `.doc-h2` is a JS hook for the TOC scrollspy. */
export function H2({
	children,
	icon = <Hash size={17} />,
}: {
	children: ReactNode;
	/** Anchor-link indicator shown on hover. @default <Hash size={17} /> */
	icon?: ReactNode;
}) {
	const id = slugify(childText(children));
	return (
		<h2
			id={id}
			className="doc-h2 group text-[22px] font-semibold tracking-[-0.02em] leading-[1.3] mt-[calc(46px*var(--density))] mb-1 pt-1.5 scroll-mt-20 flex items-center gap-2"
		>
			{children}
			<a href={`#${id}`} className={anchor()} aria-label="Link to section">
				{icon}
			</a>
		</h2>
	);
}

/** Subsection heading. `.doc-h3` is a JS hook for the TOC scrollspy. */
export function H3({
	children,
	icon = <Hash size={15} />,
}: {
	children: ReactNode;
	/** Anchor-link indicator shown on hover. @default <Hash size={15} /> */
	icon?: ReactNode;
}) {
	const id = slugify(childText(children));
	return (
		<h3
			id={id}
			className="doc-h3 group text-[17px] font-semibold tracking-[-0.01em] mt-[calc(34px*var(--density))] mb-0.5 scroll-mt-20 flex items-center gap-2"
		>
			{children}
			<a href={`#${id}`} className={anchor()} aria-label="Link to section">
				{icon}
			</a>
		</h3>
	);
}
