import type {
	DocsNavItem,
	DocsNavSection,
	SearchEntry,
} from "@dennation/typebook/react";

/* Navigation structure + flat page order + search index for the docs. */

export interface DocsFlatPage extends DocsNavItem {
	section: string;
}

export interface DocsPageMeta {
	page: DocsFlatPage;
	prev: DocsFlatPage | null;
	next: DocsFlatPage | null;
}

export const NAV: DocsNavSection[] = [
	{
		label: "Getting Started",
		icon: "rocket",
		items: [
			{ slug: "introduction", title: "Introduction" },
			{ slug: "installation", title: "Installation" },
			{ slug: "quick-start", title: "Quick Start" },
			{ slug: "theming", title: "Theming" },
		],
	},
	{
		label: "Storybook",
		icon: "box",
		items: [
			{ slug: "story", title: "Story" },
			{ slug: "variants", title: "Variants" },
			{ slug: "matrix", title: "Matrix" },
			{ slug: "playground", title: "Playground" },
			{ slug: "snippet", title: "Snippet" },
		],
	},
	{
		label: "Components",
		icon: "layers",
		items: [
			{ slug: "callout", title: "Callout" },
			{ slug: "code-block", title: "CodeBlock" },
			{ slug: "tabs", title: "Tabs" },
			{ slug: "steps", title: "Steps" },
			{ slug: "cards", title: "Cards" },
			{ slug: "accordion", title: "Accordion" },
			{ slug: "tables", title: "Tables" },
			{ slug: "prose", title: "Prose" },
			{ slug: "search", title: "Search", badge: "new" },
			{ slug: "navigation", title: "Navigation" },
			{ slug: "copy-command", title: "CopyCommand" },
			{ slug: "layout", title: "Layout" },
			{ slug: "button", title: "Button" },
			{ slug: "icon", title: "Icon" },
			{ slug: "theme-toggle", title: "ThemeToggle" },
			{ slug: "error-boundary", title: "ErrorBoundary" },
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
export const SEARCH_INDEX: SearchEntry[] = [
	{
		slug: "introduction",
		title: "Introduction",
		section: "Getting Started",
		desc: "What @dennation/typebook is and why it exists",
	},
	{
		slug: "installation",
		title: "Installation",
		section: "Getting Started",
		desc: "Add the package and the bundler plugin",
	},
	{
		slug: "quick-start",
		title: "Quick Start",
		section: "Getting Started",
		desc: "getComponentMeta() to register a component and render its stories",
	},
	{
		slug: "theming",
		title: "Theming",
		section: "Getting Started",
		desc: "OKLCH design tokens, dark mode, ThemeToggle",
	},
	{
		slug: "story",
		title: "Story",
		section: "Storybook",
		desc: "Render a single component variant",
	},
	{
		slug: "variants",
		title: "Variants",
		section: "Storybook",
		desc: "A grid of variants along one prop axis",
	},
	{
		slug: "matrix",
		title: "Matrix",
		section: "Storybook",
		desc: "Cross-product table of two prop axes",
	},
	{
		slug: "playground",
		title: "Playground",
		section: "Storybook",
		desc: "Interactive props editor with live preview",
	},
	{
		slug: "snippet",
		title: "Snippet",
		section: "Storybook",
		desc: "Live example with a show-source toggle",
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
		title: "CodeBlock",
		section: "Components",
		desc: "Syntax highlighting, tabs, line numbers, copy button",
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
		slug: "accordion",
		title: "Accordion",
		section: "Components",
		desc: "Single-open FAQ list with animated height",
	},
	{
		slug: "tables",
		title: "Tables",
		section: "Components",
		desc: "MDTable for data, PropsReference for component APIs",
	},
	{
		slug: "prose",
		title: "Prose",
		section: "Components",
		desc: "Headings with anchors, paragraphs, lists, quotes, links",
	},
	{
		slug: "search",
		title: "Search",
		section: "Components",
		desc: "SearchPalette (⌘K) and useSearchHotkeys",
	},
	{
		slug: "navigation",
		title: "Navigation",
		section: "Components",
		desc: "DocsSidebar, DocsToc, Breadcrumbs, PrevNextNav",
	},
	{
		slug: "copy-command",
		title: "CopyCommand",
		section: "Components",
		desc: "Copy-able install-command pill",
	},
	{
		slug: "layout",
		title: "Layout",
		section: "Components",
		desc: "Runtime page shell with sidebar, theme and injected styles",
	},
	{
		slug: "button",
		title: "Button",
		section: "Components",
		desc: 'Call-to-action primitive with variants, sizes and as="a"',
	},
	{
		slug: "icon",
		title: "Icon",
		section: "Components",
		desc: "Namespace of lightweight stroke icons (currentColor)",
	},
	{
		slug: "theme-toggle",
		title: "ThemeToggle",
		section: "Components",
		desc: "Toggle light/dark data-theme, persisted to localStorage",
	},
	{
		slug: "error-boundary",
		title: "ErrorBoundary",
		section: "Components",
		desc: "Catch render errors in a subtree and show a fallback",
	},
];
