import type { RegistryEntry } from '../../types.js'
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
	entry: RegistryEntry
	groups: StoryGroup[]
}

export interface SidebarNode {
	label: string
	components: ComponentNode[]
	children: SidebarNode[]
}

function buildComponentNode(entry: RegistryEntry): ComponentNode {
	const componentName = entryName(entry)
	const groupMap = new Map<string, StoryItem[]>()

	for (const [storyName, story] of Object.entries(entry.stories)) {
		const groupLabel = story.path ?? 'Stories'
		const items = groupMap.get(groupLabel) ?? []
		items.push({ name: storyName, componentName })
		groupMap.set(groupLabel, items)
	}

	const groups: StoryGroup[] = Array.from(groupMap, ([label, stories]) => ({
		label,
		stories,
	}))

	return {
		name: componentName,
		entry,
		groups,
	}
}

export function buildSidebarTree(registry: RegistryEntry[]): SidebarNode[] {
	const root: SidebarNode[] = []

	for (const entry of registry) {
		const path = entry.config.path
		const componentNode = buildComponentNode(entry)

		if (!path) {
			root.push({ label: '', components: [componentNode], children: [] })
			continue
		}

		const segments = path.split('/')
		let level = root
		let node: SidebarNode | undefined

		for (const segment of segments) {
			node = level.find((n) => n.label === segment)
			if (!node) {
				node = { label: segment, components: [], children: [] }
				level.push(node)
			}
			level = node.children
		}

		node!.components.push(componentNode)
	}

	return root
}
