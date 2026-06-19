import { defineMenu, type Menu } from "@dennation/menu";
import type { SearchEntry } from "@dennation/typebook/react";

/*
 * Docs navigation data. The sidebar lays its sections out explicitly in JSX and
 * renders each section's items through these `@dennation/menu` menus —
 * the single source of the page list. Breadcrumbs and the page title derive
 * from the same menus via `pageMeta`. Prev/next links are authored explicitly
 * on each page (see DocsFooter), not derived here. The search index is its own
 * hand-curated list.
 */

/**
 * Per-item metadata carried on docs menu nodes (see `@dennation/menu`'s generic
 * `meta`). Drives the sidebar's decorations; the renderer ignores it,
 * `sidebarMenu`'s `Item` reads it. Used as `DocsMeta | undefined` so `meta` is
 * **optional per item** — most pages carry none.
 */
export interface DocsMeta {
	/** Sidebar badge label shown after the title, e.g. `"new"`. */
	badge?: string;
}

export const GETTING_STARTED = defineMenu<DocsMeta | undefined>({
	"/docs/getting-started/introduction": { title: "Introduction" },
	"/docs/getting-started/installation": { title: "Installation" },
	"/docs/getting-started/quick-start": { title: "Quick Start" },
});

export const GUIDES = defineMenu<DocsMeta | undefined>({
	"/docs/guides/theming": { title: "Theming" },
	"/docs/guides/story": { title: "Rendering stories" },
	"/docs/guides/variants": { title: "Variant grids" },
	"/docs/guides/matrix": { title: "Prop matrices" },
	"/docs/guides/playground": { title: "Interactive playground" },
	"/docs/guides/snippet": { title: "Live snippets" },
	"/docs/guides/icons": { title: "Icons" },
});

export const COMPONENTS = defineMenu<DocsMeta | undefined>({
	"/docs/components/callout": { title: "Callout" },
	"/docs/components/code-block": { title: "CodeBlock" },
	"/docs/components/tabs": { title: "Tabs" },
	"/docs/components/steps": { title: "Steps" },
	"/docs/components/cards": { title: "Cards" },
	"/docs/components/accordion": { title: "Accordion" },
	"/docs/components/tables": { title: "Tables" },
	"/docs/components/prose": { title: "Prose" },
	"/docs/components/search": { title: "Search", meta: { badge: "new" } },
	"/docs/components/navigation": { title: "Navigation" },
	"/docs/components/copy-command": { title: "CopyCommand" },
	"/docs/components/layout": { title: "Layout" },
	"/docs/components/button": { title: "Button" },
	"/docs/components/theme-toggle": { title: "ThemeToggle" },
	"/docs/components/error-boundary": { title: "ErrorBoundary" },
});

/** Sidebar sections, paired with their label for breadcrumb/title lookup. */
export const SECTIONS: { label: string; menu: Menu<DocsMeta | undefined> }[] = [
	{ label: "Getting Started", menu: GETTING_STARTED },
	{ label: "Guides", menu: GUIDES },
	{ label: "Components", menu: COMPONENTS },
];

export const DEFAULT_DOCS_SLUG = "getting-started/introduction";

/** A page's section + title, derived from the section menus (single source). */
export interface DocsPageMeta {
	title: string;
	section: string;
}

/** Resolve a slug's title and section from the section menus. */
export function pageMeta(slug: string): DocsPageMeta {
	const href = `/docs/${slug}`;
	for (const { label, menu } of SECTIONS) {
		const item = menu.find((entry) => entry.href === href);
		if (item) return { title: item.title, section: label };
	}
	return { title: slug, section: "Docs" };
}

/** Search index — pages plus representative section headings. */
export const SEARCH_INDEX: SearchEntry[] = [
	{
		slug: "getting-started/introduction",
		title: "Introduction",
		section: "Getting Started",
		desc: "What @dennation/typebook is and why it exists",
	},
	{
		slug: "getting-started/installation",
		title: "Installation",
		section: "Getting Started",
		desc: "Add the package and the bundler plugin",
	},
	{
		slug: "getting-started/quick-start",
		title: "Quick Start",
		section: "Getting Started",
		desc: "getComponentMeta() to register a component and render its stories",
	},
	{
		slug: "guides/theming",
		title: "Theming",
		section: "Guides",
		desc: "OKLCH design tokens, dark mode, ThemeToggle",
	},
	{
		slug: "guides/story",
		title: "Rendering stories",
		section: "Guides",
		desc: "Render a single component variant",
	},
	{
		slug: "guides/variants",
		title: "Variant grids",
		section: "Guides",
		desc: "A grid of variants along one prop axis",
	},
	{
		slug: "guides/matrix",
		title: "Prop matrices",
		section: "Guides",
		desc: "Cross-product table of two prop axes",
	},
	{
		slug: "guides/playground",
		title: "Interactive playground",
		section: "Guides",
		desc: "Interactive props editor with live preview",
	},
	{
		slug: "guides/snippet",
		title: "Live snippets",
		section: "Guides",
		desc: "Live example with a show-source toggle",
	},
	{
		slug: "guides/icons",
		title: "Icons",
		section: "Guides",
		desc: "Bring your own icons — recommended lucide-react and Tabler",
	},
	{
		slug: "components/callout",
		title: "Callout",
		section: "Components",
		desc: "Highlight notes, tips, warnings and dangers",
	},
	{
		slug: "components/callout",
		title: "Callout props",
		section: "Callout",
		heading: "props",
		desc: "",
	},
	{
		slug: "components/code-block",
		title: "CodeBlock",
		section: "Components",
		desc: "Syntax highlighting, tabs, line numbers, copy button",
	},
	{
		slug: "components/tabs",
		title: "Tabs",
		section: "Components",
		desc: "Switch between related panels of content",
	},
	{
		slug: "components/steps",
		title: "Steps",
		section: "Components",
		desc: "Numbered, ordered procedures",
	},
	{
		slug: "components/cards",
		title: "Cards",
		section: "Components",
		desc: "Linkable grids for navigation",
	},
	{
		slug: "components/accordion",
		title: "Accordion",
		section: "Components",
		desc: "Single-open FAQ list with animated height",
	},
	{
		slug: "components/tables",
		title: "Tables",
		section: "Components",
		desc: "MDTable for data, PropsReference for component APIs",
	},
	{
		slug: "components/prose",
		title: "Prose",
		section: "Components",
		desc: "Headings with anchors, paragraphs, lists, quotes, links",
	},
	{
		slug: "components/search",
		title: "Search",
		section: "Components",
		desc: "SearchPalette (⌘K) and useSearchHotkeys",
	},
	{
		slug: "components/navigation",
		title: "Navigation",
		section: "Components",
		desc: "DocsSidebar, DocsToc, Breadcrumbs, PrevNextNav",
	},
	{
		slug: "components/copy-command",
		title: "CopyCommand",
		section: "Components",
		desc: "Copy-able install-command pill",
	},
	{
		slug: "components/layout",
		title: "Layout",
		section: "Components",
		desc: "Runtime page shell with sidebar, theme and injected styles",
	},
	{
		slug: "components/button",
		title: "Button",
		section: "Components",
		desc: 'Call-to-action primitive with variants, sizes and as="a"',
	},
	{
		slug: "components/theme-toggle",
		title: "ThemeToggle",
		section: "Components",
		desc: "Toggle light/dark data-theme, persisted to localStorage",
	},
	{
		slug: "components/error-boundary",
		title: "ErrorBoundary",
		section: "Components",
		desc: "Catch render errors in a subtree and show a fallback",
	},
];
