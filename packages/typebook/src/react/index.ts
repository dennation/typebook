// Domain types live in the base entry (`@dennation/typebook`); not re-exported here.
// Docs components (for consumer documentation sites)
export {
	CodeBlock,
	type CodeBlockProps,
	type CodeTab,
} from "./features/code-block/index";
export {
	CopyCommand,
	type CopyCommandProps,
} from "./features/copy-command/index";
export {
	type SearchEntry,
	type SearchHotkeyActions,
	SearchPalette,
	type SearchPaletteProps,
	useSearchHotkeys,
} from "./features/search-palette/index";
export {
	ThemeToggle,
	type ThemeToggleProps,
} from "./features/theme-toggle/index";
export { getComponentMeta } from "./getComponentMeta";
export { childText } from "./shared/lib/childText";
export { cx } from "./shared/lib/cx";
export { propsToRows } from "./shared/lib/propsToRows";
export { slugify } from "./shared/lib/slugify";
export {
	ARROW_CLASS,
	Button,
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant,
	buttonClass,
} from "./shared/ui/button/index";
// Universal design-system primitives (reusable by consumer docs sites)
export { Icon, type IconName, type IconProps } from "./shared/ui/icon/index";
export {
	A,
	Accordion,
	type AccordionItem,
	type AccordionProps,
	type AProps,
	C,
	Callout,
	type CalloutProps,
	type CalloutType,
	Cards,
	DocCard,
	type DocCardProps,
	H2,
	H3,
	Hr,
	ImgPlaceholder,
	Lead,
	Li,
	MDTable,
	type MDTableProps,
	Ol,
	P,
	type PropRowData,
	PropsReference,
	type PropsReferenceProps,
	Quote,
	Step,
	type StepProps,
	Steps,
	type TabItem,
	Tabs,
	type TabsProps,
	Ul,
} from "./shared/ui/md/index";
export { ErrorBoundary } from "./shared/ui/preview/index";
export type { ComponentMeta, DefaultedOf, PropsOf } from "./types";
export { allOf, generate, values } from "./variants";
export {
	Breadcrumbs,
	type BreadcrumbsProps,
} from "./widgets/breadcrumbs/index";
export {
	type DocsNavItem,
	type DocsNavSection,
	DocsSidebar,
	type DocsSidebarProps,
} from "./widgets/docs-sidebar/index";
export {
	type DocsHeading,
	DocsToc,
	type DocsTocProps,
	type UseDocHeadingsOptions,
	useDocHeadings,
} from "./widgets/docs-toc/index";
export { Layout, type LayoutProps } from "./widgets/layout/index";
export { Matrix, type MatrixProps } from "./widgets/matrix/index";
export {
	Playground,
	type PlaygroundProps,
} from "./widgets/playground/index";
export {
	type PrevNextItem,
	PrevNextNav,
	type PrevNextNavProps,
} from "./widgets/prev-next-nav/index";
export { Snippet, type SnippetProps } from "./widgets/snippet/index";
export { Story, type StoryProps } from "./widgets/story/index";
export { Variants, type VariantsProps } from "./widgets/variants/index";
