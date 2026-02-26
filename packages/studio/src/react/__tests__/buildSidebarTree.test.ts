import { describe, test, expect } from 'vitest'
import { buildSidebarTree } from '../utils/buildSidebarTree.js'
import type { SidebarNode } from '../utils/buildSidebarTree.js'
import type { ComponentEntry, PageResult, Story } from '../../types.js'

function makeComponent(name: string, path?: string): ComponentEntry {
	const component = () => null
	component.displayName = name
	return {
		config: {
			__type: 'define' as const,
			component,
			name,
			path,
			defaults: {},
			single: () => ({}) as any,
			variants: () => ({}) as any,
			matrix: () => ({}) as any,
			allOf: () => ({}) as any,
			values: () => ({}) as any,
			generate: () => ({}) as any,
		},
		stories: {},
		meta: { componentName: name, props: [] },
	}
}

function makeStory(overrides?: Partial<Story>): Story {
	return {
		__type: 'story',
		kind: 'single',
		component: () => null,
		defaults: {},
		render: () => null,
		...overrides,
	} as Story
}

function makePage(name: string, path?: string, order?: number): PageResult {
	return {
		__type: 'page',
		name,
		path,
		order,
		content: () => null,
	}
}

function findByType<T extends SidebarNode['type']>(
	nodes: SidebarNode[],
	type: T,
): Extract<SidebarNode, { type: T }>[] {
	return nodes.filter((n) => n.type === type) as Extract<SidebarNode, { type: T }>[]
}

describe('buildSidebarTree with pages', () => {
	test('pages appear in correct path nodes', () => {
		const pages = [makePage('Getting Started', 'Guides')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].type).toBe('group')
		expect(tree[0].label).toBe('Guides')
		const pageNodes = findByType(tree[0].children, 'page')
		expect(pageNodes).toHaveLength(1)
		expect(pageNodes[0].pageName).toBe('Getting Started')
	})

	test('pages without path go to root', () => {
		const pages = [makePage('Welcome')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].type).toBe('page')
		expect(tree[0].label).toBe('Welcome')
	})

	test('pages and components coexist in same path node', () => {
		const components = [makeComponent('Button', 'Forms')]
		const pages = [makePage('Form Guidelines', 'Forms')]
		const tree = buildSidebarTree(components, pages)

		const formsNode = tree.find((n) => n.label === 'Forms')!
		const pageNodes = findByType(formsNode.children, 'page')
		const compNodes = findByType(formsNode.children, 'component')
		expect(pageNodes).toHaveLength(1)
		expect(pageNodes[0].pageName).toBe('Form Guidelines')
		expect(compNodes).toHaveLength(1)
		expect(compNodes[0].componentName).toBe('Button')
	})

	test('pages in nested paths', () => {
		const pages = [makePage('Deep Guide', 'Docs/Advanced')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].label).toBe('Docs')
		expect(tree[0].children).toHaveLength(1)
		expect(tree[0].children[0].label).toBe('Advanced')
		const pageNodes = findByType(tree[0].children[0].children, 'page')
		expect(pageNodes).toHaveLength(1)
		expect(pageNodes[0].pageName).toBe('Deep Guide')
	})

	test('empty pages array → no pages in tree', () => {
		const components = [makeComponent('Button')]
		const tree = buildSidebarTree(components, [])

		for (const node of tree) {
			expect(findByType(node.children, 'page')).toEqual([])
		}
	})

	test('default (no pages argument) → backward compatible', () => {
		const components = [makeComponent('Button')]
		const tree = buildSidebarTree(components)

		expect(tree).toHaveLength(1)
		expect(tree[0].type).toBe('component')
	})
})

describe('buildSidebarTree with component pages', () => {
	test('component pages appear inside component node', () => {
		const entry = makeComponent('Button', 'Forms')
		const docsPage = makePage('Docs')
		const componentPages = new Map([[entry, [docsPage]]])

		const tree = buildSidebarTree([entry], [], componentPages)
		const formsNode = tree.find((n) => n.label === 'Forms')!
		const compNodes = findByType(formsNode.children, 'component')
		const comp = compNodes[0]
		const pageNodes = findByType(comp.children, 'page')

		expect(pageNodes).toHaveLength(1)
		expect(pageNodes[0].pageName).toBe('Docs')
	})

	test('component without pages has no page children', () => {
		const entry = makeComponent('Button')
		const tree = buildSidebarTree([entry], [], new Map())

		const comp = tree[0]
		expect(comp.type).toBe('component')
		expect(findByType(comp.children, 'page')).toEqual([])
	})
})

describe('buildSidebarTree with hidden stories', () => {
	test('hidden stories are excluded from sidebar tree', () => {
		const entry = makeComponent('Button')
		entry.stories = {
			Default: makeStory(),
			DocOnly: makeStory({ hidden: true }),
		}
		const tree = buildSidebarTree([entry])

		const comp = tree[0]
		const storyNodes = comp.children
			.flatMap((c) => (c.type === 'group' ? c.children : [c]))
			.filter((n) => n.type === 'story')
		const storyNames = storyNodes.map((s) => s.type === 'story' ? s.storyName : '')
		expect(storyNames).toContain('Default')
		expect(storyNames).not.toContain('DocOnly')
	})

	test('component with only hidden stories has empty groups', () => {
		const entry = makeComponent('Button')
		entry.stories = {
			DocOnly: makeStory({ hidden: true }),
		}
		const tree = buildSidebarTree([entry])

		const comp = tree[0]
		const storyNodes = comp.children
			.flatMap((c) => (c.type === 'group' ? c.children : [c]))
			.filter((n) => n.type === 'story')
		expect(storyNodes).toHaveLength(0)
	})
})

describe('buildSidebarTree story display names', () => {
	test('story label uses story.name when available', () => {
		const entry = makeComponent('Button')
		entry.stories = {
			Default: makeStory({ name: 'Primary Button' }),
		}
		const tree = buildSidebarTree([entry])

		const comp = tree[0]
		const group = comp.children.find((c) => c.type === 'group')!
		const story = group.children[0]
		expect(story.label).toBe('Primary Button')
		expect(story.type === 'story' && story.storyName).toBe('Default')
	})

	test('story label falls back to export name', () => {
		const entry = makeComponent('Button')
		entry.stories = {
			Default: makeStory(),
		}
		const tree = buildSidebarTree([entry])

		const comp = tree[0]
		const group = comp.children.find((c) => c.type === 'group')!
		expect(group.children[0].label).toBe('Default')
	})

	test('component label uses config.name', () => {
		const entry = makeComponent('Button')
		const tree = buildSidebarTree([entry])

		expect(tree[0].label).toBe('Button')
	})
})
