import type { ReactNode } from "react";

export interface DocsNavItem {
	slug: string;
	title: string;
	badge?: "new";
}

export interface DocsNavSection {
	label: string;
	/** Rendered icon element, e.g. `<Rocket size={14} />`. */
	icon: ReactNode;
	items: DocsNavItem[];
}
