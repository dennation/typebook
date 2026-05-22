import { describe, expect, test } from 'vitest'
import { analyzeFile, mayContainRegister } from '../scanner.js'

describe('mayContainRegister', () => {
	test('detects register( substring', () => {
		expect(mayContainRegister('const x = register(Foo)')).toBe(true)
	})

	test('returns false when register( absent', () => {
		expect(mayContainRegister('const x = 1')).toBe(false)
	})
})

describe('analyzeFile — register() discovery', () => {
	test('local (non-exported) register is captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from '@heroui/button'
			const button = register('button', Button)
		`)

		expect(result.registers).toHaveLength(1)
		expect(result.registers[0].id).toBe('button')
		expect(result.registers[0].componentImport).toEqual({
			name: 'Button',
			path: '@heroui/button',
		})
	})

	test('exported register is also captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			export const button = register('button', Button)
		`)

		expect(result.registers).toHaveLength(1)
		expect(result.registers[0].id).toBe('button')
		expect(result.registers[0].componentImport).toEqual({
			name: 'Button',
			path: './Button',
		})
	})

	test('default-exported register is captured', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			export default register('button', Button)
		`)

		expect(result.registers).toHaveLength(1)
		expect(result.registers[0].componentImport.name).toBe('Button')
	})

	test('multiple registers in one file', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			import { Input } from './Input'
			const a = register('button', Button)
			const b = register('input', Input)
		`)

		expect(result.registers).toHaveLength(2)
		const names = result.registers.map((d) => d.componentImport.name).sort()
		expect(names).toEqual(['Button', 'Input'])
	})

	test('default-imported component is resolved', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import MyButton from './MyButton'
			const button = register('my-button', MyButton)
		`)

		expect(result.registers[0].componentImport).toEqual({
			name: 'MyButton',
			path: './MyButton',
		})
	})

	test('renamed import resolves to original name', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button as Btn } from './components'
			const comp = register('button', Btn)
		`)

		expect(result.registers[0].componentImport).toEqual({
			name: 'Button',
			path: './components',
		})
	})

	test('file without register() returns empty', async () => {
		const result = await analyzeFile('file.tsx', `
			export const foo = 1
		`)

		expect(result.registers).toEqual([])
	})

	test('locally-declared component → register is dropped (cannot import)', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			const MyComp = () => null
			const comp = register('my-comp', MyComp)
		`)

		expect(result.registers).toEqual([])
	})

	test('records callStart for each register()', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			const button = register('button', Button)
		`)

		expect(typeof result.registers[0].callStart).toBe('number')
		expect(result.registers[0].callStart).toBeGreaterThan(0)
	})

	test('register() nested inside a function body is still found', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			function Page() {
				const b = register('button', Button)
				return null
			}
		`)

		expect(result.registers).toHaveLength(1)
		expect(result.registers[0].componentImport.name).toBe('Button')
	})

	test('non-string first arg → register is dropped', async () => {
		const result = await analyzeFile('file.tsx', `
			import { register } from '@dennation/typebook'
			import { Button } from './Button'
			const button = register(Button)
		`)

		expect(result.registers).toEqual([])
	})

	test('empty file → empty registers', async () => {
		const result = await analyzeFile('file.tsx', '')
		expect(result.registers).toEqual([])
	})
})
