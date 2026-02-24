import type { Theme } from '../hooks/useTheme.js'
import type { SidebarNode } from '../utils/buildSidebarTree.js'

export interface SidebarProps {
	tree: SidebarNode[]
	activeComponent: string | null
	activeStory: string | null
	activePage: string | null
	activeComponentPage: string | null
	selectStory: (component: string, story: string) => void
	selectPage: (pageName: string) => void
	selectComponentPage: (componentName: string, pageName: string) => void
	collapsed: Set<string>
	toggleCollapse: (key: string) => void
	disableSearch: boolean
	searchQuery: string
	onSearchChange: (query: string) => void
	theme: Theme
	onToggleTheme: () => void
}

export function Sidebar({
	tree,
	activeComponent,
	activeStory,
	activePage,
	activeComponentPage,
	selectStory,
	selectPage,
	selectComponentPage,
	collapsed,
	toggleCollapse,
	disableSearch,
	searchQuery,
	onSearchChange,
	theme,
	onToggleTheme,
}: SidebarProps) {
	const ctx: RenderContext = {
		activeComponent,
		activeStory,
		activePage,
		activeComponentPage,
		selectStory,
		selectPage,
		selectComponentPage,
		toggleCollapse,
		isNodeCollapsed: (key: string) => !searchQuery && collapsed.has(key),
	}

	return (
		<nav className="st:bg-bg-sidebar st:border-r st:border-border st:flex st:flex-col st:overflow-hidden">
			<div className="st:flex st:items-center st:justify-between st:px-4 st:pt-4 st:pb-2 st:shrink-0">
				<span className="st:text-sm st:font-semibold st:tracking-tight">
					UI Studio
				</span>
				<button
					className="st:w-7 st:h-7 st:rounded-md st:bg-transparent st:border-none st:text-text-muted st:cursor-pointer st:text-sm st:flex st:items-center st:justify-center st:transition-colors hover:st:text-text"
					title="Toggle theme"
					onClick={onToggleTheme}
					type="button"
				>
					{theme === 'light' ? '\u263C' : '\u263E'}
				</button>
			</div>
			{!disableSearch && (
				<div className="st:px-4 st:pb-3 st:shrink-0">
					<input
						type="text"
						placeholder="Search…"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="st:w-full st:px-1 st:py-1.5 st:text-sm st:bg-transparent st:border-b st:border-border st:text-text st:outline-none st:placeholder-text-muted focus:st:border-accent st:transition-colors st:rounded-none"
					/>
				</div>
			)}
			<div className="st:flex-1 st:overflow-y-auto st:pb-4">
				{renderNodes(tree, 0, '', ctx, undefined)}
			</div>
		</nav>
	)
}

interface RenderContext {
	activeComponent: string | null
	activeStory: string | null
	activePage: string | null
	activeComponentPage: string | null
	selectStory: (component: string, story: string) => void
	selectPage: (pageName: string) => void
	selectComponentPage: (componentName: string, pageName: string) => void
	toggleCollapse: (key: string) => void
	isNodeCollapsed: (key: string) => boolean
}

function renderNodes(
	nodes: SidebarNode[],
	depth: number,
	parentPath: string,
	ctx: RenderContext,
	parentComponentName: string | undefined,
) {
	return nodes.map((node) =>
		renderNode(node, depth, parentPath, ctx, parentComponentName),
	)
}

function renderNode(
	node: SidebarNode,
	depth: number,
	parentPath: string,
	ctx: RenderContext,
	parentComponentName: string | undefined,
) {
	const nodeKey = parentPath ? `${parentPath}/${node.label}` : node.label
	const hasChildren = node.children.length > 0
	const nodeCollapsed = hasChildren ? ctx.isNodeCollapsed(nodeKey) : undefined

	const isActive = getIsActive(node, ctx, parentComponentName)
	const icon = node.type === 'page' ? '\u25A2' : undefined
	const componentName = node.type === 'component' ? node.componentName : parentComponentName

	const onClick = () => {
		if (node.type === 'story') {
			if (componentName) ctx.selectStory(componentName, node.storyName)
		} else if (node.type === 'page') {
			if (parentComponentName) {
				ctx.selectComponentPage(parentComponentName, node.pageName)
			} else {
				ctx.selectPage(node.pageName)
			}
		} else if (node.type === 'component') {
			ctx.toggleCollapse(nodeKey)
			if (nodeCollapsed && ctx.activeComponent !== node.componentName) {
				const firstPage = node.children.find((c) => c.type === 'page')
				if (firstPage?.type === 'page') {
					ctx.selectComponentPage(node.componentName, firstPage.pageName)
				}
			}
		} else {
			ctx.toggleCollapse(nodeKey)
		}
	}

	return (
		<div key={`${node.type}:${node.label}`}>
			<SidebarButton
				label={node.label}
				depth={depth}
				isActive={isActive}
				collapsed={nodeCollapsed}
				icon={icon}
				onClick={onClick}
			/>
			{hasChildren && !nodeCollapsed &&
				renderNodes(node.children, depth + 1, nodeKey, ctx, componentName)}
		</div>
	)
}

function getIsActive(
	node: SidebarNode,
	ctx: RenderContext,
	parentComponentName: string | undefined,
): boolean {
	switch (node.type) {
		case 'component':
			return ctx.activeComponent === node.componentName
		case 'story':
			return ctx.activeComponent === parentComponentName && ctx.activeStory === node.storyName
		case 'page':
			if (parentComponentName) {
				return ctx.activeComponent === parentComponentName && ctx.activeComponentPage === node.pageName
			}
			return ctx.activePage === node.pageName
		default:
			return false
	}
}

function SidebarButton({
	label,
	depth,
	isActive,
	collapsed,
	icon,
	onClick,
}: {
	label: string
	depth: number
	isActive?: boolean
	collapsed?: boolean
	icon?: string
	onClick: () => void
}) {
	return (
		<button
			className={`st:flex st:items-center st:justify-between st:w-full st:py-1.5 st:pr-3 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-colors hover:st:bg-bg-hover ${
				isActive ? 'st:bg-accent-light st:font-medium' : ''
			}`}
			style={{ paddingLeft: `${depth * 12 + 16}px` }}
			onClick={onClick}
			type="button"
		>
			<span>
				{icon && <span className="st:mr-1.5 st:text-text-muted st:text-xs">{icon}</span>}
				{label}
			</span>
			{collapsed !== undefined && (
				<span className="st:text-[10px] st:leading-none st:text-text-muted">
					{collapsed ? '\u25B8' : '\u25BE'}
				</span>
			)}
		</button>
	)
}
