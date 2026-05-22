import { describe, expect, test } from 'vitest'
import { analyzeFile, mayContainRegister } from '../scanner.js'

describe('mayContainRegister', () => {
	test('detects registerComponent( substring', () => {
		expect(mayContainRegister('const x = registerComponent(Foo)')).toBe(true)
	})

	test('returns false when registerComponent( absent', () => {
		expect(mayContainRegister('const x = 1')).toBe(false)
	})
})

describe('analyzeFile — register() discovery', () => {
	test('local (non-exported) register is captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from '@heroui/button'
			const button = registerComponent('button', Button)
		`)

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('button')
		expect(result[0].componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
		})
	})

	test('exported register is also captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			export const button = registerComponent('button', Button)
		`)

		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('button')
		expect(result[0].componentImport).toEqual({
			name: 'Button',
			path: './Button',
		})
	})

	test('default-exported register is captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			export default registerComponent('button', Button)
		`)

		expect(result).toHaveLength(1)
		expect(result[0].componentImport.name).toBe('Button')
	})

	test('multiple registers in one file', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			import { Input } from './Input'
			const a = registerComponent('button', Button)
			const b = registerComponent('input', Input)
		`)

		expect(result).toHaveLength(2)
		const names = result.map((d) => d.componentImport.name).sort()
		expect(names).toEqual(['Button', 'Input'])
	})

	test('default-imported component is resolved', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import MyButton from './MyButton'
			const button = registerComponent('my-button', MyButton)
		`)

		expect(result[0].componentImport).toEqual({
			name: 'MyButton',
			path: './MyButton',
		})
	})

	test('renamed import resolves to original name', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button as Btn } from './components'
			const comp = registerComponent('button', Btn)
		`)

		expect(result[0].componentImport).toEqual({
			name: 'Button',
			path: './components',
		})
	})

	test('file without register() returns empty', async () => {
		const result = await analyzeFile('file.tsx', `
			export const foo = 1
		`)

		expect(result).toEqual([])
	})

	test('locally-declared component → register is dropped (cannot import)', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			const MyComp = () => null
			const comp = registerComponent('my-comp', MyComp)
		`)

		expect(result).toEqual([])
	})

	test('records callStart for each register()', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const button = registerComponent('button', Button)
		`)

		expect(typeof result[0].callStart).toBe('number')
		expect(result[0].callStart).toBeGreaterThan(0)
	})

	test('register() nested inside a function body is still found', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			function Page() {
				const b = registerComponent('button', Button)
				return null
			}
		`)

		expect(result).toHaveLength(1)
		expect(result[0].componentImport.name).toBe('Button')
	})

	test('non-string first arg → register is dropped', async () => {
		const result = await analyzeFile('file.tsx', `
			import { registerComponent } from '@dennation/typebook'
			import { Button } from './Button'
			const button = registerComponent(Button)
		`)

		expect(result).toEqual([])
	})

	test('empty file → empty registers', async () => {
		const result = await analyzeFile('file.tsx', '')
		expect(result).toEqual([])
	})
})
