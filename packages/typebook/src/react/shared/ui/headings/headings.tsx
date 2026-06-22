import { childText } from "@react/shared/lib/childText";
import { slugify } from "@react/shared/lib/slugify";
import { Hash } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const anchor = tv({
	base: "opacity-0 group-hover:opacity-100 text-fg-subtle transition-opacity duration-140 font-normal",
});

const heading = tv({
	base: "group font-semibold scroll-mt-20 flex items-center gap-2",
	variants: {
		level: {
			2: "doc-h2 text-[22px] tracking-[-0.02em] leading-[1.3] mt-[calc(46px*var(--density))] mb-1 pt-1.5",
			3: "doc-h3 text-[17px] tracking-[-0.01em] mt-[calc(34px*var(--density))] mb-0.5",
		},
	},
});

export interface HeadingProps {
	/** `2` → section (`.doc-h2`), `3` → subsection (`.doc-h3`). Both are TOC scrollspy hooks. */
	level: 2 | 3;
	children: ReactNode;
	/** Anchor-link indicator shown on hover. @default a `#` glyph sized to the level. */
	icon?: ReactNode;
}

/**
 * Anchored docs heading. Derives an id from its text (via `slugify`), renders a
 * hover-revealed `#` link, and carries the `.doc-h{level}` class that
 * `useDocHeadings` collects for the table of contents.
 */
export function Heading({ level, children, icon }: HeadingProps) {
	const id = slugify(childText(children));
	const Tag = level === 2 ? "h2" : "h3";
	const glyph = icon ?? <Hash size={level === 2 ? 17 : 15} />;
	return (
		<Tag id={id} className={heading({ level })}>
			{children}
			<a href={`#${id}`} className={anchor()} aria-label="Link to section">
				{glyph}
			</a>
		</Tag>
	);
}
