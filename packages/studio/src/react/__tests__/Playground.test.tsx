import { describe, test, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import type { ComponentMeta, DefineResult, PropInfo } from '../../types.js'
import { StudioMetaProvider } from '../context.js'
import { Playground } from '../components/Playground.js'

const TestComponent = (props: { label?: string; size?: 'sm' | 'md' | 'lg' }) => (
	<span data-size={props.size}>{props.label ?? 'test'}</span>
)

function makeDefineResult(defaults: Record<string, unknown> = {}): DefineResult<any> {
	return {
		__type: 'define',
		component: TestComponent,
		defaults,
		single: () => ({} as any),
		variants: () => ({} as any),
		matrix: () => ({} as any),
		allOf: () => ({} as any),
		values: () => ({} as any),
		generate: () => ({} as any),
	}
}

describe('Playground component', () => {
	test('renders component with defaults', () => {
		const config = makeDefineResult({ label: 'hello' })
		const html = renderToString(<Playground of={config} />)
		expect(html).toContain('hello')
	})

	test('renders "No props" without StudioMetaContext', () => {
		const config = makeDefineResult({ label: 'test' })
		const html = renderToString(<Playground of={config} />)
		expect(html).toContain('No props')
	})

	test('renders prop controls with StudioMetaProvider', () => {
		const config = makeDefineResult({ label: 'test', size: 'md' })
		const propInfos: PropInfo[] = [
			{ name: 'label', optional: true, type: { kind: 'string' } },
			{ name: 'size', optional: true, type: { kind: 'literal', values: ['sm', 'md', 'lg'] } },
		]
		const metaMap = new Map([[TestComponent, { componentName: 'TestComponent', props: propInfos }]]) as Map<
			React.ComponentType<any>,
			ComponentMeta
		>

		const html = renderToString(
			<StudioMetaProvider value={metaMap}>
				<Playground of={config} />
			</StudioMetaProvider>,
		)
		expect(html).toContain('label')
		expect(html).toContain('size')
		expect(html).toContain('string')
		expect(html).toContain('&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;')
	})

	test('renders component preview area', () => {
		const config = makeDefineResult({ label: 'preview' })
		const html = renderToString(<Playground of={config} />)
		expect(html).toContain('preview')
	})
})
