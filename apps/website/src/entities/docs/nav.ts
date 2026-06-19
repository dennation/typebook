import { defineMenu, type Menu } from "@dennation/menu";
import type { SearchEntry } from "@dennation/typebook/react";

/*
 * Docs navigation data. The sidebar lays its sections out explicitly in JSX and
 * renders each section's items through these three `@dennation/menu` menus —
 * the single source of the page list. Breadcrumbs and the page title derive
 * from the same menus via `pageMeta`. Prev/next links are authored explicitly
 * on each page (see DocsFooter), not derived here. The search index is its own
 * hand-curated list.
 */

export const GETTING_STARTED = defineMenu({
	"/docs/introduction": { title: "Introduction" },
	"/docs/installation": { title: "Installation" },
	"/docs/quick-start": { title: "Quick Start" },
	"/docs/theming": { title: "Theming" },
});

export const STORYBOOK = defineMenu({
	"/docs/story": { title: "Story" },
	"/docs/variants": { title: "Variants" },
	"/docs/matrix": { title: "Matrix" },
	"/docs/playground": { title: "Playground" },
	"/docs/snippet": { title: "Snippet" },
});

export const COMPONENTS = defineMenu({
	"/docs/callout": { title: "Callout" },
	"/docs/code-block": { title: "CodeBlock" },
	"/docs/tabs": { title: "Tabs" },
	"/docs/steps": { title: "Steps" },
	"/docs/cards": { title: "Cards" },
	"/docs/accordion": { title: "Accordion" },
	"/docs/tables": { title: "Tables" },
	"/docs/prose": { title: "Prose" },
	"/docs/search": { title: "Search" },
	"/docs/navigation": { title: "Navigation" },
	"/docs/copy-command": { title: "CopyCommand" },
	"/docs/layout": { title: "Layout" },
	"/docs/button": { title: "Button" },
	"/docs/icon": { title: "Icon" },
	"/docs/theme-toggle": { title: "ThemeToggle" },
	"/docs/error-boundary": { title: "ErrorBoundary" },
});

/** Sidebar sections, paired with their label for breadcrumb/title lookup. */
export const SECTIONS: { label: string; menu: Menu }[] = [
	{ label: "Getting Started", menu: GETTING_STARTED },
	{ label: "Storybook", menu: STORYBOOK },
	{ label: "Components", menu: COMPONENTS },
];

/** Hrefs whose sidebar item shows a "new" badge. */
export const NEW_PAGES = new Set<string>(["/docs/search"]);

export const DEFAULT_DOCS_SLUG = "introduction";

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
