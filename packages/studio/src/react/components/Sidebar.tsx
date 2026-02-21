import type { ComponentEntry } from '../../types.js'
import type { Theme } from '../hooks/useTheme.js'
import { DOCS_PAGE } from '../../constants.js'
import type { SidebarNode, ComponentNode } from '../utils/buildSidebarTree.js'

export interface SidebarProps {
	tree: SidebarNode[]
	activeComponent: string | null
	activeStory: string | null
	selectStory: (component: string, story: string) => void
	collapsed: Set<string>
	toggleCollapse: (key: string) => void
	disableSearch: boolean
	searchQuery: string
	onSearchChange: (query: string) => void
	stories: Record<string, ComponentEntry['stories']>
	theme: Theme
	onToggleTheme: () => void
}

export function Sidebar({
	tree,
	activeComponent,
	activeStory,
	selectStory,
	collapsed,
	toggleCollapse,
	disableSearch,
	searchQuery,
	onSearchChange,
	stories,
	theme,
	onToggleTheme,
}: SidebarProps) {
	const isNodeCollapsed = (key: string) => !searchQuery && collapsed.has(key)

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
				{renderTree(tree, 0, '', {
					activeComponent,
					activeStory,
					selectStory,
					toggleCollapse,
					isNodeCollapsed,
					stories,
				})}
			</div>
		</nav>
	)
}

interface RenderContext {
	activeComponent: string | null
	activeStory: string | null
	selectStory: (component: string, story: string) => void
	toggleCollapse: (key: string) => void
	isNodeCollapsed: (key: string) => boolean
	stories: Record<string, ComponentEntry['stories']>
}

function renderTree(
	nodes: SidebarNode[],
	depth: number,
	parentPath: string,
	ctx: RenderContext,
) {
	return nodes.map((node) => {
		if (!node.label) {
			return node.components.map((comp) =>
				renderComponentNode(comp, depth, parentPath, ctx),
			)
		}

		const nodeKey = parentPath ? `${parentPath}/${node.label}` : node.label
		const hasChildren = node.children.length > 0 || node.components.length > 0
		const nodeCollapsed = ctx.isNodeCollapsed(nodeKey)

		return (
			<div key={node.label}>
				<SidebarButton
					label={node.label}
					depth={depth}
					collapsed={hasChildren ? nodeCollapsed : undefined}
					onClick={() => hasChildren && ctx.toggleCollapse(nodeKey)}
				/>
				{!nodeCollapsed && (
					<>
						{node.components.map((comp) =>
							renderComponentNode(comp, depth + 1, nodeKey, ctx),
						)}
						{renderTree(node.children, depth + 1, nodeKey, ctx)}
					</>
				)}
			</div>
		)
	})
}

function renderComponentNode(
	comp: ComponentNode,
	depth: number,
	parentPath: string,
	ctx: RenderContext,
) {
	const compKey = parentPath ? `${parentPath}/${comp.name}` : comp.name
	const compCollapsed = ctx.isNodeCollapsed(compKey)
	const isActiveComp = ctx.activeComponent === comp.name

	return (
		<div key={comp.name}>
			<SidebarButton
				label={comp.entry.config.name ?? comp.name}
				depth={depth}
				isActive={isActiveComp}
				collapsed={compCollapsed}
				onClick={() => {
					ctx.toggleCollapse(compKey)
					if (compCollapsed && ctx.activeComponent !== comp.name) {
						ctx.selectStory(comp.name, DOCS_PAGE)
					}
				}}
			/>
			{!compCollapsed && (
				<>
					<SidebarButton
						label={DOCS_PAGE}
						isActive={ctx.activeComponent === comp.name && ctx.activeStory === DOCS_PAGE}
						depth={depth + 1}
						onClick={() => ctx.selectStory(comp.name, DOCS_PAGE)}
					/>
					{comp.groups.map((group) => {
						const groupKey = `${compKey}/${group.label}`
						const groupCollapsed = ctx.isNodeCollapsed(groupKey)
						return (
							<div key={group.label}>
								<SidebarButton
									label={group.label}
									depth={depth + 1}
									collapsed={groupCollapsed}
									onClick={() => ctx.toggleCollapse(groupKey)}
								/>
								{!groupCollapsed &&
									group.stories.map((s) => {
										const story = ctx.stories[comp.name]?.[s.name]
										return (
											<SidebarButton
												key={s.name}
												label={story?.name ?? s.name}
												isActive={
													ctx.activeComponent === s.componentName &&
													ctx.activeStory === s.name
												}
												depth={depth + 2}
												onClick={() => ctx.selectStory(s.componentName, s.name)}
											/>
										)
									})}
							</div>
						)
					})}
				</>
			)}
		</div>
	)
}

function SidebarButton({
	label,
	depth,
	isActive,
	collapsed,
	onClick,
}: {
	label: string
	depth: number
	isActive?: boolean
	collapsed?: boolean
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
			<span>{label}</span>
			{collapsed !== undefined && (
				<span className="st:text-[10px] st:leading-none st:text-text-muted">
					{collapsed ? '\u25B8' : '\u25BE'}
				</span>
			)}
		</button>
	)
}
