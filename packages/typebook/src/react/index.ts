// Domain types live in the base entry (`@dennation/typebook`); not re-exported here.
// Docs components (for consumer documentation sites)
export {
	CodeBlock,
	type CodeBlockProps,
	CodeBlockTab,
	type CodeBlockTabProps,
} from "./features/code-block/index";
export {
	CopyCommand,
	type CopyCommandProps,
} from "./features/copy-command/index";
export {
	ThemeToggle,
	type ThemeToggleProps,
} from "./features/theme-toggle/index";
export { getComponentMeta } from "./getComponentMeta";
export { childText } from "./shared/lib/childText";
export { cx } from "./shared/lib/cx";
export { propsToRows } from "./shared/lib/propsToRows";
export { slugify } from "./shared/lib/slugify";
export { type UseCopy, useCopy } from "./shared/lib/useCopy";
// Universal design-system primitives (reusable by consumer docs sites)
export {
	Accordion,
	type AccordionItem,
	type AccordionProps,
} from "./shared/ui/accordion/index";
export {
	ARROW_CLASS,
	Button,
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant,
	buttonClass,
} from "./shared/ui/button/index";
export {
	Callout,
	type CalloutProps,
	type CalloutType,
} from "./shared/ui/callout/index";
export { Cards, DocCard, type DocCardProps } from "./shared/ui/cards/index";
export { H2, H3 } from "./shared/ui/headings/index";
export { MDTable, type MDTableProps } from "./shared/ui/md-table/index";
export { ErrorBoundary } from "./shared/ui/preview/index";
export {
	type PropRowData,
	PropsReference,
	type PropsReferenceProps,
} from "./shared/ui/props-reference/index";
export {
	A,
	type AProps,
	C,
	Hr,
	ImgPlaceholder,
	Lead,
	Li,
	Ol,
	P,
	Quote,
	Ul,
} from "./shared/ui/prose/index";
export { Step, type StepProps, Steps } from "./shared/ui/steps/index";
export { type TabItem, Tabs, type TabsProps } from "./shared/ui/tabs/index";
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
export {
	Snippet,
	type SnippetProps,
	type SnippetRenderProps,
} from "./widgets/snippet/index";
export { Story, type StoryProps } from "./widgets/story/index";
export { Variants, type VariantsProps } from "./widgets/variants/index";
