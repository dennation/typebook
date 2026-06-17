// Docs components (for consumer documentation sites)
export {
	CodeBlock,
	type CodeBlockProps,
	type CodeTab,
} from "./features/code-block/index.js";
export {
	CopyCommand,
	type CopyCommandProps,
} from "./features/copy-command/index.js";
export {
	type SearchEntry,
	type SearchHotkeyActions,
	SearchPalette,
	type SearchPaletteProps,
	useSearchHotkeys,
} from "./features/search-palette/index.js";
export {
	ThemeToggle,
	type ThemeToggleProps,
} from "./features/theme-toggle/index.js";
export { childText } from "./shared/lib/childText.js";
export { cx } from "./shared/lib/cx.js";
export { propsToRows } from "./shared/lib/propsToRows.js";
export { slugify } from "./shared/lib/slugify.js";
export {
	ARROW_CLASS,
	Button,
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant,
	buttonClass,
} from "./shared/ui/button/index.js";
// Universal design-system primitives (reusable by consumer docs sites)
export { Icon, type IconName, type IconProps } from "./shared/ui/icon/index.js";
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
} from "./shared/ui/md/index.js";
export { ErrorBoundary } from "./shared/ui/preview/index.js";
export {
	Breadcrumbs,
	type BreadcrumbsProps,
} from "./widgets/breadcrumbs/index.js";
export {
	type DocsNavItem,
	type DocsNavSection,
	DocsSidebar,
	type DocsSidebarProps,
} from "./widgets/docs-sidebar/index.js";
export {
	type DocsHeading,
	DocsToc,
	type DocsTocProps,
	type UseDocHeadingsOptions,
	useDocHeadings,
} from "./widgets/docs-toc/index.js";
export { Layout, type LayoutProps } from "./widgets/layout/index.js";
export { Matrix, type MatrixProps } from "./widgets/matrix/index.js";
export {
	Playground,
	type PlaygroundProps,
} from "./widgets/playground/index.js";
export {
	type PrevNextItem,
	PrevNextNav,
	type PrevNextNavProps,
} from "./widgets/prev-next-nav/index.js";
export { Snippet, type SnippetProps } from "./widgets/snippet/index.js";
export { Story, type StoryProps } from "./widgets/story/index.js";
export { Variants, type VariantsProps } from "./widgets/variants/index.js";
