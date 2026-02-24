import { describe, test, expect } from 'vitest'
import { buildSidebarTree } from '../utils/buildSidebarTree.js'
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
		meta: { props: [] },
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

describe('buildSidebarTree with pages', () => {
	test('pages appear in correct path nodes', () => {
		const pages = [makePage('Getting Started', 'Guides')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].label).toBe('Guides')
		expect(tree[0].pages).toHaveLength(1)
		expect(tree[0].pages[0].name).toBe('Getting Started')
	})

	test('pages without path go to root', () => {
		const pages = [makePage('Welcome')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].label).toBe('')
		expect(tree[0].pages).toHaveLength(1)
		expect(tree[0].pages[0].name).toBe('Welcome')
	})

	test('pages sorted by order then name', () => {
		const pages = [
			makePage('Changelog', 'Docs', 2),
			makePage('API Reference', 'Docs', 1),
			makePage('Zeta Guide', 'Docs', 1),
		]
		const tree = buildSidebarTree([], pages)

		const node = tree[0]
		expect(node.pages[0].name).toBe('API Reference')
		expect(node.pages[1].name).toBe('Zeta Guide')
		expect(node.pages[2].name).toBe('Changelog')
	})

	test('pages and components coexist in same path node', () => {
		const components = [makeComponent('Button', 'Forms')]
		const pages = [makePage('Form Guidelines', 'Forms')]
		const tree = buildSidebarTree(components, pages)

		const formsNode = tree.find((n) => n.label === 'Forms')!
		expect(formsNode.pages).toHaveLength(1)
		expect(formsNode.pages[0].name).toBe('Form Guidelines')
		expect(formsNode.components).toHaveLength(1)
		expect(formsNode.components[0].name).toBe('Button')
	})

	test('pages in nested paths', () => {
		const pages = [makePage('Deep Guide', 'Docs/Advanced')]
		const tree = buildSidebarTree([], pages)

		expect(tree).toHaveLength(1)
		expect(tree[0].label).toBe('Docs')
		expect(tree[0].children).toHaveLength(1)
		expect(tree[0].children[0].label).toBe('Advanced')
		expect(tree[0].children[0].pages).toHaveLength(1)
		expect(tree[0].children[0].pages[0].name).toBe('Deep Guide')
	})

	test('empty pages array → no pages in tree', () => {
		const components = [makeComponent('Button')]
		const tree = buildSidebarTree(components, [])

		for (const node of tree) {
			expect(node.pages).toEqual([])
		}
	})

	test('default (no pages argument) → backward compatible', () => {
		const components = [makeComponent('Button')]
		const tree = buildSidebarTree(components)

		expect(tree).toHaveLength(1)
		expect(tree[0].pages).toEqual([])
	})

	test('pages with default order (0) sorted by name', () => {
		const pages = [
			makePage('Bravo', 'Docs'),
			makePage('Alpha', 'Docs'),
			makePage('Charlie', 'Docs'),
		]
		const tree = buildSidebarTree([], pages)

		const names = tree[0].pages.map((p) => p.name)
		expect(names).toEqual(['Alpha', 'Bravo', 'Charlie'])
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

		const comp = tree[0].components[0]
		const allStoryNames = comp.groups.flatMap((g) => g.stories.map((s) => s.name))
		expect(allStoryNames).toContain('Default')
		expect(allStoryNames).not.toContain('DocOnly')
	})

	test('component with only hidden stories has empty groups', () => {
		const entry = makeComponent('Button')
		entry.stories = {
			DocOnly: makeStory({ hidden: true }),
		}
		const tree = buildSidebarTree([entry])

		const comp = tree[0].components[0]
		const allStoryNames = comp.groups.flatMap((g) => g.stories.map((s) => s.name))
		expect(allStoryNames).toHaveLength(0)
	})
})
