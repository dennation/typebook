import { describe, test, expect } from 'vitest'
import { analyzeStoryFile, analyzePageFile } from '../scanner.js'

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

	test('export function → collected', async () => {
		const result = await analyzeStoryFile(`
			export function Default() { return null }
			export function Sizes() { return null }
		`)
		expect(result.namedExports).toEqual(['Default', 'Sizes'])
	})

	test('export class → collected', async () => {
		const result = await analyzeStoryFile(`
			export class Widget {}
		`)
		expect(result.namedExports).toEqual(['Widget'])
	})

	test('export { x as Renamed } → uses exported name', async () => {
		const result = await analyzeStoryFile(`
			const x = 1
			export { x as Renamed }
		`)
		expect(result.namedExports).toEqual(['Renamed'])
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

	test('named import + describe() → resolves import', async () => {
		const result = await analyzeStoryFile(`
			import { describe } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'
			const button = describe(Button)
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

	test('describe() inside exported const → resolves import', async () => {
		const result = await analyzeStoryFile(`
			import { describe } from '@dennation/ui-studio'
			import { Input } from '@heroui/input'
			export const input = describe(Input)
		`)
		expect(result.componentImport).toEqual({
			name: 'Input',
			path: '@heroui/input',
		})
	})

	test('export default define(Component) → resolves import directly', async () => {
		const result = await analyzeStoryFile(`
			import { define } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'
			export default define(Button)
		`)
		expect(result.defaultExport).toBe(true)
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
		})
	})

	test('export default describe(Component) → resolves import directly', async () => {
		const result = await analyzeStoryFile(`
			import { describe } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'
			export default describe(Button)
		`)
		expect(result.defaultExport).toBe(true)
		expect(result.componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
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
	test('realistic story file with define()', async () => {
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

	test('realistic story file with describe()', async () => {
		const result = await analyzeStoryFile(`
			import { describe } from '@dennation/ui-studio'
			import { Button } from '@heroui/button'

			const button = describe(Button, {
				defaults: { children: 'Click me' },
				props: ['size', 'variant'],
			})

			export const Sizes = button.variants({ items: button.allOf('size') })
			export default button
		`)

		expect(result.defaultExport).toBe(true)
		expect(result.namedExports).toEqual(['Sizes'])
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

// --- analyzePageFile ---

describe('analyzePageFile', () => {
	test('file with export default definePage(...) → defaultExport: true', async () => {
		const result = await analyzePageFile(`
			import { definePage } from '@dennation/ui-studio'
			export default definePage({
				name: 'Getting Started',
				content: () => null,
			})
		`)
		expect(result.defaultExport).toBe(true)
	})

	test('file with variable + export default → defaultExport: true', async () => {
		const result = await analyzePageFile(`
			import { definePage } from '@dennation/ui-studio'
			const page = definePage({ name: 'Guide', content: () => null })
			export default page
		`)
		expect(result.defaultExport).toBe(true)
	})

	test('file without default export → defaultExport: false', async () => {
		const result = await analyzePageFile(`
			import { definePage } from '@dennation/ui-studio'
			export const page = definePage({ name: 'Guide', content: () => null })
		`)
		expect(result.defaultExport).toBe(false)
	})

	test('file without definePage → defaultExport: false', async () => {
		const result = await analyzePageFile(`
			const x = 1
		`)
		expect(result.defaultExport).toBe(false)
	})

	test('empty file → defaultExport: false', async () => {
		const result = await analyzePageFile('')
		expect(result.defaultExport).toBe(false)
	})
})
