import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

export interface BreadcrumbsProps {
	/** Trail items, root first. The last item is highlighted as current. */
	items: ReactNode[];
	/** Separator between items. @default <ChevronRight size={13} /> */
	separator?: ReactNode;
}

const breadcrumbs = tv({
	slots: {
		root: "flex items-center gap-1.75 text-[13px] text-fg-subtle mb-4.5",
		item: "",
		sep: "opacity-60 inline-flex",
	},
	variants: {
		last: {
			true: { item: "text-fg-muted" },
		},
	},
});

/** Chevron-separated breadcrumb trail above a docs page title. */
export function Breadcrumbs({
	items,
	separator = <ChevronRight size={13} />,
}: BreadcrumbsProps) {
	const { root, item, sep } = breadcrumbs();
	return (
		<div className={root()}>
			{items.map((entry, i) => {
				const last = i === items.length - 1;
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: static positional trail
					<span key={i} className="contents">
						<span className={item({ last })}>{entry}</span>
						{!last && <span className={sep()}>{separator}</span>}
					</span>
				);
			})}
		</div>
	);
}
