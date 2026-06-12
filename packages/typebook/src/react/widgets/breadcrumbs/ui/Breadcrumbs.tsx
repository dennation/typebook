import { Icon } from "@react/shared/ui/icon/index.js";
import type { ReactNode } from "react";

export interface BreadcrumbsProps {
	/** Trail items, root first. The last item is highlighted as current. */
	items: ReactNode[];
}

/** Chevron-separated breadcrumb trail above a docs page title. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<div className="flex items-center gap-[7px] text-[13px] text-fg-subtle mb-[18px]">
			{items.map((item, i) => {
				const last = i === items.length - 1;
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: static positional trail
					<span key={i} className="contents">
						<span className={last ? "text-fg-muted" : undefined}>{item}</span>
						{!last && (
							<span className="opacity-60 inline-flex">
								<Icon.chevR size={13} />
							</span>
						)}
					</span>
				);
			})}
		</div>
	);
}
