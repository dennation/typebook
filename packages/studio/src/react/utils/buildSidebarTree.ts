import type { ComponentEntry, PageResult } from '../../types.js'
import { entryName } from './naming.js'

export interface GroupNode {
	type: 'group'
	label: string
	children: SidebarNode[]
}

export interface ComponentNode {
	type: 'component'
	label: string
	componentName: string
	children: SidebarNode[]
}

export interface PageNode {
	type: 'page'
	label: string
	pageName: string
	children: SidebarNode[]
}

export interface StoryNode {
	type: 'story'
	label: string
	storyName: string
	children: SidebarNode[]
}

export type SidebarNode = GroupNode | ComponentNode | PageNode | StoryNode

function buildComponentChildren(
	entry: ComponentEntry,
	componentPageResults: PageResult[] = [],
): SidebarNode[] {
	const children: SidebarNode[] = []

	for (const page of componentPageResults) {
		children.push({
			type: 'page',
			label: page.name,
			pageName: page.name,
			children: [],
		})
	}

	const groupMap = new Map<string, SidebarNode[]>()

	for (const [storyName, story] of Object.entries(entry.stories)) {
		if (story.hidden) continue
		const groupLabel = story.path ?? 'Stories'
		const items = groupMap.get(groupLabel) ?? []
		items.push({
			type: 'story',
			label: story.name ?? storyName,
			storyName,
			children: [],
		})
		groupMap.set(groupLabel, items)
	}

	for (const [groupLabel, stories] of groupMap) {
		children.push({
			type: 'group',
			label: groupLabel,
			children: stories,
		})
	}

	return children
}

function findOrCreateGroup(level: SidebarNode[], label: string): GroupNode {
	const existing = level.find((n): n is GroupNode => n.type === 'group' && n.label === label)
	if (existing) return existing
	const node: GroupNode = { type: 'group', label, children: [] }
	level.push(node)
	return node
}

export function buildSidebarTree(
	components: ComponentEntry[],
	pages: PageResult[] = [],
	componentPages: Map<ComponentEntry, PageResult[]> = new Map(),
): SidebarNode[] {
	const root: SidebarNode[] = []

	for (const page of pages) {
		const pageNode: PageNode = {
			type: 'page',
			label: page.name,
			pageName: page.name,
			children: [],
		}

		if (!page.path) {
			root.push(pageNode)
			continue
		}

		const segments = page.path.split('/')
		let level = root
		for (const segment of segments) {
			const group = findOrCreateGroup(level, segment)
			level = group.children
		}
		level.push(pageNode)
	}

	for (const entry of components) {
		const componentName = entryName(entry)
		const componentNode: ComponentNode = {
			type: 'component',
			label: entry.config.name ?? componentName,
			componentName,
			children: buildComponentChildren(entry, componentPages.get(entry)),
		}

		const path = entry.config.path
		if (!path) {
			root.push(componentNode)
			continue
		}

		const segments = path.split('/')
		let level = root
		for (const segment of segments) {
			const group = findOrCreateGroup(level, segment)
			level = group.children
		}
		level.push(componentNode)
	}

	return root
}
