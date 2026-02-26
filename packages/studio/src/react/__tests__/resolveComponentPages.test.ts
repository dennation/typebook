import { describe, test, expect } from 'vitest'
import type { ComponentType } from 'react'
import type { ComponentEntry, PageResult } from '../../types.js'
import { DEFAULT_DOCS_PAGE } from '../../constants.js'
import { resolveComponentPages, docsPagePath } from '../utils/resolveComponentPages.js'

function makeComponent(name: string, path?: string, autoDocs?: boolean): ComponentEntry {
	const component = (() => null) as unknown as ComponentType<any>
	component.displayName = name
	return {
		config: {
			__type: 'define' as const,
			component,
			name,
			path,
			defaults: {},
			autoDocs,
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

function makePage(name: string, path?: string): PageResult {
	return {
		__type: 'page',
		name,
		path,
		content: (() => null) as unknown as ComponentType,
	}
}

const stubContent = (() => null) as unknown as ComponentType
const createDocsContent = () => stubContent

describe('docsPagePath', () => {
	test('component with path', () => {
		const entry = makeComponent('Button', 'Forms')
		expect(docsPagePath(entry)).toBe('Forms/Button')
	})

	test('component without path', () => {
		const entry = makeComponent('Button')
		expect(docsPagePath(entry)).toBe('Button')
	})

	test('component with nested path', () => {
		const entry = makeComponent('Button', 'UI/Forms')
		expect(docsPagePath(entry)).toBe('UI/Forms/Button')
	})
})

describe('resolveComponentPages', () => {
	test('generates default docs page for each component', () => {
		const components = [makeComponent('Button', 'Forms'), makeComponent('Input', 'Forms')]
		const result = resolveComponentPages(components, [], createDocsContent)

		expect(result.componentPages.size).toBe(2)
		for (const entry of components) {
			const pages = result.componentPages.get(entry)!
			expect(pages).toHaveLength(1)
			expect(pages[0].name).toBe(DEFAULT_DOCS_PAGE)
			expect(pages[0].__type).toBe('page')
		}
		expect(result.topLevelPages).toEqual([])
	})

	test('skips components with autoDocs: false', () => {
		const button = makeComponent('Button', 'Forms')
		const input = makeComponent('Input', 'Forms', false)
		const result = resolveComponentPages([button, input], [], createDocsContent)

		expect(result.componentPages.size).toBe(1)
		expect(result.componentPages.has(button)).toBe(true)
		expect(result.componentPages.has(input)).toBe(false)
	})

	test('detects user override and extracts from top-level', () => {
		const button = makeComponent('Button', 'Forms')
		const userPage = makePage(DEFAULT_DOCS_PAGE, 'Forms/Button')
		const otherPage = makePage('Getting Started', 'Guides')

		const result = resolveComponentPages([button], [userPage, otherPage], createDocsContent)

		// Override page should be attached to component
		const compPages = result.componentPages.get(button)!
		expect(compPages).toHaveLength(1)
		expect(compPages[0]).toBe(userPage) // same reference

		// Top-level should only have the non-override page
		expect(result.topLevelPages).toHaveLength(1)
		expect(result.topLevelPages[0]).toBe(otherPage)
	})

	test('non-matching user page is not consumed', () => {
		const button = makeComponent('Button', 'Forms')
		const unrelatedPage = makePage(DEFAULT_DOCS_PAGE, 'Other/Path')

		const result = resolveComponentPages([button], [unrelatedPage], createDocsContent)

		// Auto-generated page for button
		const compPages = result.componentPages.get(button)!
		expect(compPages[0].content).toBe(stubContent)

		// Unrelated page stays in top-level
		expect(result.topLevelPages).toHaveLength(1)
		expect(result.topLevelPages[0]).toBe(unrelatedPage)
	})

	test('auto-generated page has order -1', () => {
		const button = makeComponent('Button')
		const result = resolveComponentPages([button], [], createDocsContent)

		const compPages = result.componentPages.get(button)!
		expect(compPages[0].order).toBe(-1)
	})

	test('empty components → empty result', () => {
		const result = resolveComponentPages([], [makePage('Page')], createDocsContent)

		expect(result.componentPages.size).toBe(0)
		expect(result.topLevelPages).toHaveLength(1)
	})

	test('override for component without path', () => {
		const button = makeComponent('Button')
		const userPage = makePage(DEFAULT_DOCS_PAGE, 'Button')

		const result = resolveComponentPages([button], [userPage], createDocsContent)

		const compPages = result.componentPages.get(button)!
		expect(compPages[0]).toBe(userPage)
		expect(result.topLevelPages).toHaveLength(0)
	})
})
