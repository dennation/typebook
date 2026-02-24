import type { Story as StoryType, PropInfo } from '../../types.js'
import { useStudioMeta } from '../context.js'
import { StoryRenderer } from './StoryRenderer.js'

export function Story({ of }: { of: StoryType }) {
	const propsMap = useStudioMeta()
	const props: PropInfo[] = propsMap.get(of.component) ?? []
	return <StoryRenderer story={of} props={props} />
}
