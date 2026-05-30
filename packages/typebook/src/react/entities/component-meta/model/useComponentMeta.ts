import type { ComponentMeta } from '@/types.js'
import { useRegistry } from './context.js'

/**
 * Looks up registry metadata for a component by its registration id.
 * Returns `undefined` when no entry is registered for the id.
 */
export function useComponentMeta(id: string): ComponentMeta | undefined {
	const registry = useRegistry()
	return registry[id]
}
