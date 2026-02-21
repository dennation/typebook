import type { RegistryEntry } from '../../types.js'
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
	stories: Record<string, RegistryEntry['stories']>
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
}: SidebarProps) {
	const isNodeCollapsed = (key: string) => !searchQuery && collapsed.has(key)

	return (
		<nav className="st:bg-bg-sidebar st:border-r st:border-border st:overflow-y-auto st:py-2">
			{!disableSearch && (
				<div className="st:px-3 st:pb-2">
					<input
						type="text"
						placeholder="Search…"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="st:w-full st:px-2.5 st:py-1.5 st:text-sm st:rounded-md st:border st:border-border st:bg-bg st:text-text st:outline-none st:placeholder-text-muted focus:st:border-accent"
					/>
				</div>
			)}
			{renderTree(tree, 0, '', {
				activeComponent,
				activeStory,
				selectStory,
				toggleCollapse,
				isNodeCollapsed,
				stories,
			})}
		</nav>
	)
}

interface RenderContext {
	activeComponent: string | null
	activeStory: string | null
	selectStory: (component: string, story: string) => void
	toggleCollapse: (key: string) => void
	isNodeCollapsed: (key: string) => boolean
	stories: Record<string, RegistryEntry['stories']>
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
				<SidebarPathNode
					label={node.label}
					depth={depth}
					hasChildren={hasChildren}
					collapsed={nodeCollapsed}
					onToggle={() => hasChildren && ctx.toggleCollapse(nodeKey)}
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
			<SidebarComponentHeader
				name={comp.entry.config.name ?? comp.name}
				depth={depth}
				isActive={isActiveComp}
				collapsed={compCollapsed}
				onToggle={() => {
					ctx.toggleCollapse(compKey)
					if (compCollapsed && ctx.activeComponent !== comp.name) {
						ctx.selectStory(comp.name, DOCS_PAGE)
					}
				}}
			/>
			{!compCollapsed && (
				<>
					<SidebarItem
						storyKey={DOCS_PAGE}
						label={DOCS_PAGE}
						isActive={ctx.activeComponent === comp.name && ctx.activeStory === DOCS_PAGE}
						depth={depth + 1}
						onClick={() => ctx.selectStory(comp.name, DOCS_PAGE)}
					/>
					{comp.groups.map((group) => {
						const groupKey = `${compKey}/${group.label}`
						const groupCollapsed = ctx.isNodeCollapsed(groupKey)
						return (
							<SidebarGroup
								key={group.label}
								label={group.label}
								depth={depth + 1}
								collapsed={groupCollapsed}
								onToggle={() => ctx.toggleCollapse(groupKey)}
							>
								{!groupCollapsed &&
									group.stories.map((s) => {
										const story = ctx.stories[comp.name]?.[s.name]
										return (
											<SidebarItem
												key={s.name}
												storyKey={s.name}
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
							</SidebarGroup>
						)
					})}
				</>
			)}
		</div>
	)
}

function SidebarItem({
	label,
	isActive,
	depth,
	onClick,
}: {
	storyKey: string
	label: string
	isActive: boolean
	depth: number
	onClick: () => void
}) {
	return (
		<button
			className={`st:block st:w-full st:py-1.5 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${
				isActive ? 'st:bg-accent-light st:text-accent st:font-semibold' : ''
			}`}
			style={{ paddingLeft: `${depth * 12 + 8}px` }}
			onClick={onClick}
			type="button"
		>
			{label}
		</button>
	)
}

function SidebarComponentHeader({
	name,
	depth,
	isActive,
	collapsed,
	onToggle,
}: {
	name: string
	depth: number
	isActive: boolean
	collapsed: boolean
	onToggle: () => void
}) {
	return (
		<button
			className={`st:flex st:items-center st:justify-between st:w-full st:py-1.5 st:pr-3 st:text-sm st:border-none st:bg-transparent st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover ${
				isActive ? 'st:text-accent st:font-semibold' : 'st:text-text'
			}`}
			style={{ paddingLeft: `${depth * 12 + 8}px` }}
			onClick={onToggle}
			type="button"
		>
			<span>{name}</span>
			<span className="st:text-[10px] st:leading-none st:text-text-muted">
				{collapsed ? '\u25B8' : '\u25BE'}
			</span>
		</button>
	)
}

function SidebarGroup({
	label,
	depth,
	collapsed,
	onToggle,
	children,
}: {
	label: string
	depth: number
	collapsed: boolean
	onToggle: () => void
	children: React.ReactNode
}) {
	return (
		<div>
			<button
				className="st:flex st:items-center st:justify-between st:w-full st:py-1.5 st:pr-3 st:text-sm st:border-none st:bg-transparent st:text-text st:cursor-pointer st:text-left st:transition-all hover:st:bg-bg-hover"
				style={{ paddingLeft: `${depth * 12 + 8}px` }}
				onClick={onToggle}
				type="button"
			>
				<span>{label}</span>
				<span className="st:text-[10px] st:leading-none st:text-text-muted">
					{collapsed ? '\u25B8' : '\u25BE'}
				</span>
			</button>
			{children}
		</div>
	)
}

function SidebarPathNode({
	label,
	depth,
	hasChildren,
	collapsed,
	onToggle,
}: {
	label: string
	depth: number
	hasChildren: boolean
	collapsed: boolean
	onToggle: () => void
}) {
	return (
		<button
			className="st:flex st:items-center st:justify-between st:w-full st:pt-3 st:pb-1 st:pr-3 st:text-xs st:font-semibold st:uppercase st:tracking-wide st:text-text-muted st:bg-transparent st:border-none st:cursor-pointer st:text-left hover:st:text-text"
			style={{ paddingLeft: `${(depth + 1) * 12}px` }}
			onClick={onToggle}
			type="button"
		>
			<span>{label}</span>
			{hasChildren && (
				<span className="st:text-[10px] st:leading-none">
					{collapsed ? '\u25B8' : '\u25BE'}
				</span>
			)}
		</button>
	)
}
