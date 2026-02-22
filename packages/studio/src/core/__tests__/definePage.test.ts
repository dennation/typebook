import { describe, test, expect } from 'vitest'
import { definePage } from '../../definePage.js'

describe('definePage', () => {
	test('returns object with __type: "page"', () => {
		const result = definePage({
			name: 'Test',
			content: () => null,
		})
		expect(result.__type).toBe('page')
	})

	test('passes through name', () => {
		const result = definePage({
			name: 'Getting Started',
			content: () => null,
		})
		expect(result.name).toBe('Getting Started')
	})

	test('passes through path', () => {
		const result = definePage({
			name: 'Guide',
			path: 'Guides',
			content: () => null,
		})
		expect(result.path).toBe('Guides')
	})

	test('passes through order', () => {
		const result = definePage({
			name: 'Guide',
			order: 5,
			content: () => null,
		})
		expect(result.order).toBe(5)
	})

	test('passes through content as ComponentType', () => {
		const Content = () => null
		const result = definePage({
			name: 'Guide',
			content: Content,
		})
		expect(result.content).toBe(Content)
	})

	test('path and order are optional', () => {
		const result = definePage({
			name: 'Guide',
			content: () => null,
		})
		expect(result.path).toBeUndefined()
		expect(result.order).toBeUndefined()
	})
})
