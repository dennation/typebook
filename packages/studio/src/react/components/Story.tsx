import type { Story as StoryType, PropInfo } from '../../types.js'
import { useStudioMeta } from '../context.js'
import { StoryRenderer } from './StoryRenderer.js'

export function Story({ of }: { of: StoryType }) {
	const metaMap = useStudioMeta()
	const props: PropInfo[] = metaMap.get(of.component)?.props ?? []
	return <StoryRenderer story={of} props={props} />
}
