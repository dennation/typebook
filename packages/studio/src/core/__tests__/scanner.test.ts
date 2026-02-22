import { describe, test, expect } from 'vitest'
import { analyzeStoryFile } from '../scanner.js'

// --- Named exports ---

describe('named exports', () => {
	test('export const → collected', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from './Button'
			const button = define(Button)
			export const Default = button.single()
			export const Sizes = button.variants({ items: button.allOf('size') })
		`)
		expect(result.namedExports).toEqual(['Default', 'Sizes'])
	})

	test('export { X, Y } → collected', async () => {
		const result = await analyzeStoryFile(`
			const Default = 1
			const Sizes = 2
			export { Default, Sizes }
		`)
		expect(result.namedExports).toEqual(['Default', 'Sizes'])
	})

	test('export { X } from "./other" → collected', async () => {
		const result = await analyzeStoryFile(`
			export { Foo, Bar } from './other'
		`)
		expect(result.namedExports).toEqual(['Foo', 'Bar'])
	})

	test('re-export default as named is excluded', async () => {
		const result = await analyzeStoryFile(`
			const x = 1
			export { x as default }
		`)
		// 'default' should not appear in namedExports
		expect(result.namedExports).toEqual([])
	})

	test('multiple export const in one declaration', async () => {
		const result = await analyzeStoryFile(`
			export const A = 1, B = 2, C = 3
		`)
		expect(result.namedExports).toEqual(['A', 'B', 'C'])
	})

	test('no exports → empty array', async () => {
		const result = await analyzeStoryFile(`
			const x = 1
		`)
		expect(result.namedExports).toEqual([])
	})
})

// --- Default export ---

describe('default export', () => {
	test('export default expression → true', async () => {
		const result = await analyzeStoryFile(`
			const button = { test: true }
			export default button
		`)
		expect(result.defaultExport).toBe(true)
	})

	test('export default inline → true', async () => {
		const result = await analyzeStoryFile(`
			export default { test: true }
		`)
		expect(result.defaultExport).toBe(true)
	})

	test('no default export → false', async () => {
		const result = await analyzeStoryFile(`
			export const Foo = 1
		`)
		expect(result.defaultExport).toBe(false)
	})
})

// --- Component import resolution ---

describe('component import', () => {
	test('named import + define() → resolves import', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'
			const button = define(Button)
			export default button
		`)
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
		})
	})

	test('default import + define() → resolves import', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import MyButton from './MyButton'
			const button = define(MyButton)
			export default button
		`)
		expect(result.componentImport).toEqual({
			name: 'MyButton',
			path: './MyButton',
		})
	})

	test('renamed import + define() → resolves to original name', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button as Btn } from './components'
			const comp = define(Btn)
			export default comp
		`)
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: './components',
		})
	})

	test('no define() call → componentImport is null', async () => {
		const result = await analyzeStoryFile(`
			import { Button } from './Button'
			export const Foo = 1
		`)
		expect(result.componentImport).toBeNull()
	})

	test('define() with unresolvable arg → componentImport is null', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			const MyComp = () => null
			const comp = define(MyComp)
			export default comp
		`)
		// MyComp is declared locally, not imported — no matching import
		expect(result.componentImport).toBeNull()
	})

	test('define() inside exported const → resolves import', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Input } from '@heroui/input'
			export const input = define(Input)
		`)
		expect(result.componentImport).toEqual({
			name: 'Input',
			path: '@heroui/input',
		})
	})

	test('multiple define() calls → picks first one', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from './Button'
			import { Input } from './Input'
			const button = define(Button)
			const input = define(Input)
			export default button
		`)
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: './Button',
		})
	})
})

// --- Combined scenarios ---

describe('full story file', () => {
	test('realistic story file', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'

			const button = define(Button, {
				defaults: { children: 'Click me' },
				props: ['size', 'variant', 'color', 'disabled'],
			})

			export const Default = button.single({ props: { size: 'md' } })
			export const Sizes = button.variants({ items: button.allOf('size') })
			export const Colors = button.variants({ items: button.allOf('color'), columns: 3 })

			export const Matrix = button.matrix({
				x: button.allOf('color'),
				y: [button.allOf('variant')],
				path: 'Matrix',
			})

			export default button
		`)

		expect(result.defaultExport).toBe(true)
		expect(result.namedExports).toEqual(['Default', 'Sizes', 'Colors', 'Matrix'])
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
		})
	})

	test('empty file → safe defaults', async () => {
		const result = await analyzeStoryFile('')
		expect(result.defaultExport).toBe(false)
		expect(result.namedExports).toEqual([])
		expect(result.componentImport).toBeNull()
	})

	test('only imports, no exports → empty', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from './Button'
		`)
		expect(result.defaultExport).toBe(false)
		expect(result.namedExports).toEqual([])
		expect(result.componentImport).toBeNull()
	})
})
