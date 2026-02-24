import type { ComponentEntry, PageResult } from '../../types.js'
import { entryName } from './naming.js'

export interface StoryItem {
	name: string
	componentName: string
}

export interface StoryGroup {
	label: string
	stories: StoryItem[]
}

export interface ComponentNode {
	name: string
	entry: ComponentEntry
	groups: StoryGroup[]
	pages: PageNode[]
}

export interface PageNode {
	name: string
	page: PageResult
}

export interface SidebarNode {
	label: string
	components: ComponentNode[]
	pages: PageNode[]
	children: SidebarNode[]
}

function buildComponentNode(
	entry: ComponentEntry,
	componentPageResults: PageResult[] = [],
): ComponentNode {
	const componentName = entryName(entry)
	const groupMap = new Map<string, StoryItem[]>()

	for (const [storyName, story] of Object.entries(entry.stories)) {
		if (story.hidden) continue
		const groupLabel = story.path ?? 'Stories'
		const items = groupMap.get(groupLabel) ?? []
		items.push({ name: storyName, componentName })
		groupMap.set(groupLabel, items)
	}

	const groups: StoryGroup[] = Array.from(groupMap, ([label, stories]) => ({
		label,
		stories,
	}))

	const pages = sortPages(
		componentPageResults.map((p) => ({ name: p.name, page: p })),
	)

	return {
		name: componentName,
		entry,
		groups,
		pages,
	}
}

function sortPages(pages: PageNode[]): PageNode[] {
	return [...pages].sort((a, b) => {
		const orderA = a.page.order ?? 0
		const orderB = b.page.order ?? 0
		if (orderA !== orderB) return orderA - orderB
		return a.name.localeCompare(b.name)
	})
}

export function buildSidebarTree(
	components: ComponentEntry[],
	pages: PageResult[] = [],
	componentPages: Map<ComponentEntry, PageResult[]> = new Map(),
): SidebarNode[] {
	const root: SidebarNode[] = []

	// Place pages into tree by path
	for (const page of pages) {
		const path = page.path
		const pageNode: PageNode = { name: page.name, page }

		if (!path) {
			// Find or create a root-level node for path-less pages
			let rootNode = root.find((n) => n.label === '')
			if (!rootNode) {
				rootNode = { label: '', components: [], pages: [], children: [] }
				root.push(rootNode)
			}
			rootNode.pages.push(pageNode)
			continue
		}

		const segments = path.split('/')
		let level = root
		let node: SidebarNode | undefined

		for (const segment of segments) {
			node = level.find((n) => n.label === segment)
			if (!node) {
				node = { label: segment, components: [], pages: [], children: [] }
				level.push(node)
			}
			level = node.children
		}

		node!.pages.push(pageNode)
	}

	// Place components into tree by path
	for (const entry of components) {
		const path = entry.config.path
		const componentNode = buildComponentNode(entry, componentPages.get(entry))

		if (!path) {
			root.push({ label: '', components: [componentNode], pages: [], children: [] })
			continue
		}

		const segments = path.split('/')
		let level = root
		let node: SidebarNode | undefined

		for (const segment of segments) {
			node = level.find((n) => n.label === segment)
			if (!node) {
				node = { label: segment, components: [], pages: [], children: [] }
				level.push(node)
			}
			level = node.children
		}

		node!.components.push(componentNode)
	}

	// Sort pages within each node
	sortPagesInTree(root)

	return root
}

function sortPagesInTree(nodes: SidebarNode[]): void {
	for (const node of nodes) {
		node.pages = sortPages(node.pages)
		sortPagesInTree(node.children)
	}
}
