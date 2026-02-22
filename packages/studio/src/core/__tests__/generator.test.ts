import { resolve } from 'node:path'
import { describe, test, expect } from 'vitest'
import { generateMetaFile, generateRegistryFile } from '../generator.js'
import type { PropInfo } from '../../types.js'
import type { StoryAnalysis } from '../scanner.js'

const CWD = '/project'

function makeFile(
	filePath: string,
	analysis: StoryAnalysis,
	props: PropInfo[] = [],
) {
	return { filePath, analysis, props }
}

function makeAnalysis(overrides: Partial<StoryAnalysis> = {}): StoryAnalysis {
	return {
		defaultExport: true,
		namedExports: [],
		componentImport: null,
		...overrides,
	}
}

// --- generateMetaFile ---

describe('generateMetaFile', () => {
	test('empty files → valid empty meta', () => {
		const result = generateMetaFile([], CWD)
		expect(result).toContain('const meta: Record<string, ComponentMeta> = {}')
		expect(result).toContain('export default meta')
		expect(result).toContain('auto-generated')
	})

	test('single file with props → keyed by relative path', () => {
		const props: PropInfo[] = [
			{ name: 'size', optional: true, type: { kind: 'literal', values: ['sm', 'md'] } },
			{ name: 'disabled', optional: false, type: { kind: 'boolean' } },
		]
		const result = generateMetaFile(
			[makeFile('/project/src/Button.stories.tsx', makeAnalysis(), props)],
			CWD,
		)
		expect(result).toContain('"src/Button.stories.tsx"')
		expect(result).toContain('"name": "size"')
		expect(result).toContain('"optional": true')
		expect(result).toContain('"kind": "literal"')
		expect(result).toContain('"sm"')
		expect(result).toContain('"name": "disabled"')
		expect(result).toContain('"kind": "boolean"')
	})

	test('multiple files → all keyed', () => {
		const result = generateMetaFile([
			makeFile('/project/src/A.stories.tsx', makeAnalysis(), []),
			makeFile('/project/src/B.stories.tsx', makeAnalysis(), []),
		], CWD)
		expect(result).toContain('"src/A.stories.tsx"')
		expect(result).toContain('"src/B.stories.tsx"')
	})

	test('file with no props → empty props array', () => {
		const result = generateMetaFile(
			[makeFile('/project/src/Empty.stories.tsx', makeAnalysis(), [])],
			CWD,
		)
		expect(result).toContain('"props": []')
	})

	test('all prop types serialized correctly', () => {
		const props: PropInfo[] = [
			{ name: 'a', optional: false, type: { kind: 'string' } },
			{ name: 'b', optional: false, type: { kind: 'number' } },
			{ name: 'c', optional: false, type: { kind: 'boolean' } },
			{ name: 'd', optional: false, type: { kind: 'node' } },
			{ name: 'e', optional: false, type: { kind: 'function' } },
			{ name: 'f', optional: false, type: { kind: 'unknown', raw: 'SomeType' } },
		]
		const result = generateMetaFile(
			[makeFile('/project/src/All.stories.tsx', makeAnalysis(), props)],
			CWD,
		)
		expect(result).toContain('"kind": "string"')
		expect(result).toContain('"kind": "number"')
		expect(result).toContain('"kind": "boolean"')
		expect(result).toContain('"kind": "node"')
		expect(result).toContain('"kind": "function"')
		expect(result).toContain('"kind": "unknown"')
		expect(result).toContain('"raw": "SomeType"')
	})
})

// --- generateRegistryFile ---

const REGISTRY_PATH = resolve(CWD, 'ui-studio-registry.gen.ts')
const META_PATH = resolve(CWD, 'ui-studio-meta.gen.ts')

describe('generateRegistryFile', () => {
	test('empty files → valid empty registry', () => {
		const result = generateRegistryFile([], REGISTRY_PATH, META_PATH, CWD)
		expect(result).toContain('components: [')
		expect(result).toContain('export default registry')
		expect(result).toContain("import meta from './ui-studio-meta.gen'")
	})

	test('single file with default + named exports', () => {
		const file = makeFile(
			'/project/src/stories/Button.stories.tsx',
			makeAnalysis({
				defaultExport: true,
				namedExports: ['Default', 'Sizes'],
				componentImport: { name: 'Button', path: '@heroui/button' },
			}),
		)
		const result = generateRegistryFile([file], REGISTRY_PATH, META_PATH, CWD)

		// Import line: default + named
		expect(result).toContain('import _Button, { Default as _Button_Default, Sizes as _Button_Sizes }')
		expect(result).toContain("from './src/stories/Button.stories'")

		// Registry entry
		expect(result).toContain('config: _Button,')
		expect(result).toContain('stories: { Default: _Button_Default, Sizes: _Button_Sizes }')
		expect(result).toContain("meta: meta['src/stories/Button.stories.tsx']")
	})

	test('file with only named exports (no default)', () => {
		const file = makeFile(
			'/project/src/stories/Input.stories.tsx',
			makeAnalysis({
				defaultExport: false,
				namedExports: ['Default', 'Sizes'],
				componentImport: { name: 'Input', path: './Input' },
			}),
		)
		const result = generateRegistryFile([file], REGISTRY_PATH, META_PATH, CWD)

		// Named-only import (no default)
		expect(result).toContain('import { Default as _Input_Default, Sizes as _Input_Sizes }')
		// No bare _Input in import
		expect(result).not.toMatch(/import _Input,/)
	})

	test('file with only default export (no named)', () => {
		const file = makeFile(
			'/project/src/stories/Switch.stories.tsx',
			makeAnalysis({
				defaultExport: true,
				namedExports: [],
				componentImport: { name: 'Switch', path: './Switch' },
			}),
		)
		const result = generateRegistryFile([file], REGISTRY_PATH, META_PATH, CWD)

		expect(result).toContain("import _Switch from './src/stories/Switch.stories'")
		expect(result).toContain('stories: {  }')
	})

	test('name collision → unique prefixes', () => {
		const files = [
			makeFile(
				'/project/src/a/Button.stories.tsx',
				makeAnalysis({
					namedExports: ['Default'],
					componentImport: { name: 'Button', path: './a/Button' },
				}),
			),
			makeFile(
				'/project/src/b/Button.stories.tsx',
				makeAnalysis({
					namedExports: ['Default'],
					componentImport: { name: 'Button', path: './b/Button' },
				}),
			),
		]
		const result = generateRegistryFile(files, REGISTRY_PATH, META_PATH, CWD)

		// First gets _Button, second gets _Button2
		expect(result).toContain('config: _Button,')
		expect(result).toContain('config: _Button2,')

		// Named exports get unique aliases
		expect(result).toContain('Default as _Button_Default')
		expect(result).toContain('Default as _Button2_Default')

		// Stories reference their own aliases
		expect(result).toContain('stories: { Default: _Button_Default }')
		expect(result).toContain('stories: { Default: _Button2_Default }')

		// Imports come from different paths
		expect(result).toContain("from './src/a/Button.stories'")
		expect(result).toContain("from './src/b/Button.stories'")

		// Meta keys are distinct
		expect(result).toContain("meta['src/a/Button.stories.tsx']")
		expect(result).toContain("meta['src/b/Button.stories.tsx']")
	})

	test('three components with same name → _X, _X2, _X3', () => {
		const files = [
			makeFile('/project/src/a/Card.stories.tsx', makeAnalysis({
				namedExports: ['Default'],
				componentImport: { name: 'Card', path: './a/Card' },
			})),
			makeFile('/project/src/b/Card.stories.tsx', makeAnalysis({
				namedExports: ['Default'],
				componentImport: { name: 'Card', path: './b/Card' },
			})),
			makeFile('/project/src/c/Card.stories.tsx', makeAnalysis({
				namedExports: ['Default'],
				componentImport: { name: 'Card', path: './c/Card' },
			})),
		]
		const result = generateRegistryFile(files, REGISTRY_PATH, META_PATH, CWD)

		expect(result).toContain('config: _Card,')
		expect(result).toContain('config: _Card2,')
		expect(result).toContain('config: _Card3,')
		expect(result).toContain('Default as _Card_Default')
		expect(result).toContain('Default as _Card2_Default')
		expect(result).toContain('Default as _Card3_Default')
	})

	test('no componentImport → fallback to Component{index}', () => {
		const file = makeFile(
			'/project/src/stories/Unknown.stories.tsx',
			makeAnalysis({
				namedExports: ['Foo'],
				componentImport: null,
			}),
		)
		const result = generateRegistryFile([file], REGISTRY_PATH, META_PATH, CWD)

		expect(result).toContain('_Component0')
		expect(result).toContain('Foo as _Component0_Foo')
	})

	test('relative import paths computed from registry location', () => {
		const registryPath = resolve(CWD, 'generated/registry.gen.ts')
		const metaPath = resolve(CWD, 'generated/meta.gen.ts')
		const file = makeFile(
			'/project/src/stories/Button.stories.tsx',
			makeAnalysis({
				namedExports: ['Default'],
				componentImport: { name: 'Button', path: '@heroui/button' },
			}),
		)
		const result = generateRegistryFile([file], registryPath, metaPath, CWD)

		// Import should go up from generated/ to src/stories/
		expect(result).toContain("from '../src/stories/Button.stories'")
		expect(result).toContain("import meta from './meta.gen'")
	})

	test('.tsx extension stripped from import paths', () => {
		const file = makeFile(
			'/project/src/Button.stories.tsx',
			makeAnalysis({
				namedExports: ['Default'],
				componentImport: { name: 'Button', path: './Button' },
			}),
		)
		const result = generateRegistryFile([file], REGISTRY_PATH, META_PATH, CWD)

		// Import path should not contain .tsx
		expect(result).toContain("from './src/Button.stories'")
		expect(result).not.toMatch(/from '.*\.tsx'/)
		// But meta key legitimately contains .tsx (it's a file path, not an import)
		expect(result).toContain("meta['src/Button.stories.tsx']")
	})

	test('multiple files → multiple entries in correct order', () => {
		const files = [
			makeFile(
				'/project/src/A.stories.tsx',
				makeAnalysis({
					namedExports: ['X'],
					componentImport: { name: 'A', path: './A' },
				}),
			),
			makeFile(
				'/project/src/B.stories.tsx',
				makeAnalysis({
					namedExports: ['Y'],
					componentImport: { name: 'B', path: './B' },
				}),
			),
			makeFile(
				'/project/src/C.stories.tsx',
				makeAnalysis({
					namedExports: ['Z'],
					componentImport: { name: 'C', path: './C' },
				}),
			),
		]
		const result = generateRegistryFile(files, REGISTRY_PATH, META_PATH, CWD)

		const configA = result.indexOf('config: _A,')
		const configB = result.indexOf('config: _B,')
		const configC = result.indexOf('config: _C,')
		expect(configA).toBeLessThan(configB)
		expect(configB).toBeLessThan(configC)
	})
})
