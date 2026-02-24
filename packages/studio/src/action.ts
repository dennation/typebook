// --- Types ---

export interface ActionLogEntry {
	readonly id: number
	readonly timestamp: number
	readonly actionName: string
	readonly previewId: string
	readonly args: readonly unknown[]
}

// --- ActionStore — framework-agnostic singleton ---

type Listener = () => void

let entries: readonly ActionLogEntry[] = []
let nextId = 1
const listeners = new Set<Listener>()

function emit(): void {
	for (const listener of listeners) {
		listener()
	}
}

export const actionStore = {
	log(actionName: string, previewId: string, args: readonly unknown[]): void {
		entries = [...entries, { id: nextId++, timestamp: Date.now(), actionName, previewId, args }]
		emit()
	},

	getSnapshot(): readonly ActionLogEntry[] {
		return entries
	},

	clear(previewId?: string): void {
		entries = previewId
			? entries.filter((e) => e.previewId !== previewId)
			: []
		emit()
	},

	subscribe(callback: Listener): () => void {
		listeners.add(callback)
		return () => {
			listeners.delete(callback)
		}
	},
}
