import { describe, test, expect } from 'vitest'
import { define } from '../../define.js'
import { describe as studioDescribe } from '../../describe.js'

const MockComponent = () => null
MockComponent.displayName = 'MockComponent'

describe('define()', () => {
	test('returns object with __type: "define"', () => {
		const result = define(MockComponent)
		expect(result.__type).toBe('define')
	})

	test('stores component reference', () => {
		const result = define(MockComponent)
		expect(result.component).toBe(MockComponent)
	})

	test('stores name from config', () => {
		const result = define(MockComponent, { name: 'My Button' })
		expect(result.name).toBe('My Button')
	})

	test('stores defaults from config', () => {
		const result = define(MockComponent, { defaults: { children: 'Hello' } })
		expect(result.defaults).toEqual({ children: 'Hello' })
	})

	test('creates single story', () => {
		const result = define(MockComponent)
		const story = result.single({ props: { children: 'Test' } })
		expect(story.__type).toBe('story')
		expect(story.kind).toBe('single')
		expect(story.component).toBe(MockComponent)
	})

	test('creates variants story', () => {
		const result = define(MockComponent)
		const story = result.variants({ items: result.allOf('size' as any) })
		expect(story.kind).toBe('variants')
	})

	test('creates matrix story', () => {
		const result = define(MockComponent)
		const story = result.matrix({
			x: result.allOf('color' as any),
			y: [result.allOf('variant' as any)],
		})
		expect(story.kind).toBe('matrix')
	})

	test('single story passes hidden flag', () => {
		const result = define(MockComponent)
		const story = result.single({ hidden: true })
		expect(story.hidden).toBe(true)
	})

	test('variants story passes hidden flag', () => {
		const result = define(MockComponent)
		const story = result.variants({ items: result.allOf('size' as any), hidden: true })
		expect(story.hidden).toBe(true)
	})

	test('matrix story passes hidden flag', () => {
		const result = define(MockComponent)
		const story = result.matrix({
			x: result.allOf('color' as any),
			y: [result.allOf('variant' as any)],
			hidden: true,
		})
		expect(story.hidden).toBe(true)
	})

	test('hidden defaults to undefined', () => {
		const result = define(MockComponent)
		const story = result.single()
		expect(story.hidden).toBeUndefined()
	})

	test('allOf() returns correct config', () => {
		const result = define(MockComponent)
		expect(result.allOf('size' as any)).toEqual({ __type: 'allOf', prop: 'size' })
	})

	test('values() returns correct config', () => {
		const result = define(MockComponent)
		expect(result.values('size' as any, ['sm', 'md'] as any)).toEqual({
			__type: 'values',
			prop: 'size',
			values: ['sm', 'md'],
		})
	})

	test('generate() returns correct config', () => {
		const fn = () => 'test'
		const result = define(MockComponent)
		expect(result.generate('size' as any, fn as any, 3)).toEqual({
			__type: 'generate',
			prop: 'size',
			fn,
			count: 3,
		})
	})
})

describe('describe() deprecated alias', () => {
	test('works identically to define()', () => {
		const result = studioDescribe(MockComponent, { name: 'Test', defaults: { children: 'Hello' } })
		expect(result.__type).toBe('define')
		expect(result.component).toBe(MockComponent)
		expect(result.name).toBe('Test')
		expect(result.defaults).toEqual({ children: 'Hello' })
	})

	test('creates stories via alias', () => {
		const result = studioDescribe(MockComponent)
		const story = result.single()
		expect(story.__type).toBe('story')
		expect(story.kind).toBe('single')
	})
})
