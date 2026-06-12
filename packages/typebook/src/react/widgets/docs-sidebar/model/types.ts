import type { IconName } from "@react/shared/ui/icon/index.js";

export interface DocsNavItem {
	slug: string;
	title: string;
	badge?: "new";
}

export interface DocsNavSection {
	label: string;
	icon: IconName;
	items: DocsNavItem[];
}
