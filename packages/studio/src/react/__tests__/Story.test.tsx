import { describe, test, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import type { SingleStory, VariantsStory, ComponentMeta, PropInfo } from '../../types.js'
import { StudioMetaProvider } from '../context.js'
import { Story } from '../components/Story.js'

const TestComponent = (props: { label?: string }) => <span>{props.label ?? 'test'}</span>

function makeSingleStory(props?: Record<string, unknown>): SingleStory {
	return {
		__type: 'story',
		kind: 'single',
		component: TestComponent,
		defaults: { label: 'default' },
		render: (p) => <TestComponent {...p} />,
		props,
	}
}

function makeVariantsStory(): VariantsStory {
	return {
		__type: 'story',
		kind: 'variants',
		component: TestComponent,
		defaults: { label: 'default' },
		render: (p) => <TestComponent {...p} />,
		items: { __type: 'allOf', prop: 'label' },
	}
}

describe('Story component', () => {
	test('renders single story via StoryRenderer', () => {
		const story = makeSingleStory({ label: 'hello' })
		const html = renderToString(<Story of={story} />)
		expect(html).toContain('hello')
	})

	test('renders single story with defaults when no props', () => {
		const story = makeSingleStory()
		const html = renderToString(<Story of={story} />)
		expect(html).toContain('default')
	})

	test('renders variants story without context — graceful fallback with empty props', () => {
		const story = makeVariantsStory()
		// Without context, propsMap is empty → allOf cannot resolve → renders empty grid
		const html = renderToString(<Story of={story} />)
		expect(html).toBeDefined()
	})

	test('renders variants story with StudioMetaProvider — resolves PropInfo', () => {
		const story = makeVariantsStory()
		const propInfos: PropInfo[] = [
			{ name: 'label', optional: true, type: { kind: 'literal', values: ['alpha', 'beta'] } },
		]
		const metaMap = new Map([[TestComponent, { componentName: 'TestComponent', props: propInfos }]]) as Map<React.ComponentType<any>, ComponentMeta>

		const html = renderToString(
			<StudioMetaProvider value={metaMap}>
				<Story of={story} />
			</StudioMetaProvider>,
		)
		expect(html).toContain('alpha')
		expect(html).toContain('beta')
	})
})
