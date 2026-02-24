import { useMemo } from 'react'
import type { ActionLogEntry } from '../../action.js'

export interface ActionSummary {
	readonly actionName: string
	readonly callCount: number
	readonly lastArgs: readonly unknown[]
	readonly lastTimestamp: number
}

export function useActionSummary(entries: readonly ActionLogEntry[]): readonly ActionSummary[] {
	return useMemo(() => {
		const map = new Map<string, ActionSummary>()
		for (const entry of entries) {
			const existing = map.get(entry.actionName)
			map.set(entry.actionName, {
				actionName: entry.actionName,
				callCount: (existing?.callCount ?? 0) + 1,
				lastArgs: entry.args,
				lastTimestamp: entry.timestamp,
			})
		}
		return Array.from(map.values())
	}, [entries])
}
