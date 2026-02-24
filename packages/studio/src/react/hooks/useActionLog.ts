import { useSyncExternalStore, useMemo } from 'react'
import { actionStore, type ActionLogEntry } from '../../action.js'

export function useActionLog(previewId: string | null): readonly ActionLogEntry[] {
	const allEntries = useSyncExternalStore(
		actionStore.subscribe,
		actionStore.getSnapshot,
		actionStore.getSnapshot,
	)

	return useMemo(
		() => (previewId ? allEntries.filter((e) => e.previewId === previewId) : []),
		[allEntries, previewId],
	)
}
