import type { IconName } from "@dennation/typebook/react";

/* Navigation structure + flat page order + search index for the docs. */

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

export interface DocsFlatPage extends DocsNavItem {
	section: string;
}

export interface DocsPageMeta {
	page: DocsFlatPage;
	prev: DocsFlatPage | null;
	next: DocsFlatPage | null;
}

export interface DocsSearchEntry {
	slug: string;
	title: string;
	section: string;
	desc: string;
	/** Anchor id when the entry points at a heading inside a page. */
	heading?: string;
}

export const NAV: DocsNavSection[] = [
	{
		label: "Getting Started",
		icon: "rocket",
		items: [
			{ slug: "introduction", title: "Introduction" },
			{ slug: "installation", title: "Installation" },
			{ slug: "quick-start", title: "Quick Start" },
		],
	},
	{
		label: "Guides",
		icon: "book",
		items: [
			{ slug: "writing-content", title: "Writing Content" },
			{ slug: "markdown", title: "Markdown & MDX" },
			{ slug: "configuration", title: "Configuration" },
			{ slug: "theming", title: "Theming" },
			{ slug: "search-setup", title: "Search", badge: "new" },
		],
	},
	{
		label: "Components",
		icon: "box",
		items: [
			{ slug: "callout", title: "Callout" },
			{ slug: "code-block", title: "Code Block" },
			{ slug: "tabs", title: "Tabs" },
			{ slug: "steps", title: "Steps" },
			{ slug: "cards", title: "Cards" },
		],
	},
	{
		label: "API Reference",
		icon: "cog",
		items: [
			{ slug: "create-docs", title: "createDocs()" },
			{ slug: "docs-layout", title: "<DocsLayout />" },
			{ slug: "use-search", title: "useSearch()" },
		],
	},
];

/** Flat page order for prev/next navigation and search. */
export const FLAT: DocsFlatPage[] = NAV.flatMap((sec) =>
	sec.items.map((it) => ({ ...it, section: sec.label })),
);

export const DEFAULT_DOCS_SLUG = "introduction";

export function isDocsSlug(slug: string): boolean {
	return FLAT.some((p) => p.slug === slug);
}

export function pageMeta(slug: string): DocsPageMeta {
	const idx = Math.max(
		0,
		FLAT.findIndex((p) => p.slug === slug),
	);
	return {
		page: FLAT[idx] as DocsFlatPage,
		prev: idx > 0 ? (FLAT[idx - 1] as DocsFlatPage) : null,
		next: idx < FLAT.length - 1 ? (FLAT[idx + 1] as DocsFlatPage) : null,
	};
}

/** Search index — pages plus representative section headings. */
export const SEARCH_INDEX: DocsSearchEntry[] = [
	{
		slug: "introduction",
		title: "Introduction",
		section: "Getting Started",
		desc: "What Typebok is and why it exists",
	},
	{
		slug: "installation",
		title: "Installation",
		section: "Getting Started",
		desc: "Add Typebok to a new or existing project",
	},
	{
		slug: "installation",
		title: "Install with the CLI",
		section: "Installation",
		heading: "install-with-the-cli",
		desc: "",
	},
	{
		slug: "quick-start",
		title: "Quick Start",
		section: "Getting Started",
		desc: "Ship your first docs page in five minutes",
	},
	{
		slug: "markdown",
		title: "Markdown & MDX",
		section: "Guides",
		desc: "Every block element Typebok renders",
	},
	{
		slug: "configuration",
		title: "Configuration",
		section: "Guides",
		desc: "The typebok.config.ts file",
	},
	{
		slug: "theming",
		title: "Theming",
		section: "Guides",
		desc: "Design tokens, dark mode, custom CSS",
	},
	{
		slug: "search-setup",
		title: "Search",
		section: "Guides",
		desc: "Wire up the command palette",
	},
	{
		slug: "callout",
		title: "Callout",
		section: "Components",
		desc: "Highlight notes, tips, warnings and dangers",
	},
	{
		slug: "callout",
		title: "Callout props",
		section: "Callout",
		heading: "props",
		desc: "",
	},
	{
		slug: "code-block",
		title: "Code Block",
		section: "Components",
		desc: "Syntax highlighting, tabs, copy button",
	},
	{
		slug: "tabs",
		title: "Tabs",
		section: "Components",
		desc: "Switch between related panels of content",
	},
	{
		slug: "steps",
		title: "Steps",
		section: "Components",
		desc: "Numbered, ordered procedures",
	},
	{
		slug: "cards",
		title: "Cards",
		section: "Components",
		desc: "Linkable grids for navigation",
	},
	{
		slug: "create-docs",
		title: "createDocs()",
		section: "API Reference",
		desc: "The root source loader",
	},
	{
		slug: "docs-layout",
		title: "<DocsLayout />",
		section: "API Reference",
		desc: "Sidebar, header and TOC shell",
	},
	{
		slug: "use-search",
		title: "useSearch()",
		section: "API Reference",
		desc: "Headless hook for custom search UIs",
	},
];
