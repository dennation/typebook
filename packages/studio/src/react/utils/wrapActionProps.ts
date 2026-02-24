import { actionStore } from '../../action.js'
import type { PropInfo } from '../../types.js'

/**
 * Wraps all function props with action logging.
 * - Existing functions: logs the call, then invokes the original.
 * - Missing function props (from PropInfo): auto-generates logging stubs.
 * Action name = prop key name (e.g. "onClick", "onChange").
 */
export function wrapActionProps(
	props: Record<string, unknown>,
	previewId: string,
	propInfos?: readonly PropInfo[],
): Record<string, unknown> {
	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(props)) {
		if (typeof value === 'function') {
			result[key] = (...args: unknown[]) => {
				actionStore.log(key, previewId, args)
				return (value as Function)(...args)
			}
		} else {
			result[key] = value
		}
	}

	// Auto-generate stubs for function props not already in props
	if (propInfos) {
		for (const info of propInfos) {
			if (info.type.kind === 'function' && !(info.name in result)) {
				const name = info.name
				result[name] = (...args: unknown[]) => {
					actionStore.log(name, previewId, args)
				}
			}
		}
	}

	return result
}
