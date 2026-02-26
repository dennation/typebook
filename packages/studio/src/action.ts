// --- Types ---

export interface ActionLogEntry {
	readonly id: number
	readonly timestamp: number
	readonly actionName: string
	readonly previewId: string
	readonly formattedArgs: string
	readonly inherited: boolean
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

function formatArg(value: unknown): string {
	if (value === undefined) return 'undefined'
	if (value === null) return 'null'
	if (typeof value === 'function') return 'fn()'
	if (typeof value !== 'object') return String(value)
	// DOM nodes and events — short-circuit before any property access
	if (typeof Event !== 'undefined' && value instanceof Event) return value.constructor.name
	if (typeof Node !== 'undefined' && value instanceof Node) return value.nodeName
	try {
		const json = JSON.stringify(value)
		return json.length > 80 ? `${json.slice(0, 77)}...` : json
	} catch {
		return `[${value.constructor?.name ?? 'object'}]`
	}
}

export const actionStore = {
	log(actionName: string, previewId: string, args: readonly unknown[], inherited: boolean): void {
		const formattedArgs = args.length === 0 ? '' : args.map(formatArg).join(', ')
		entries = [...entries, { id: nextId++, timestamp: Date.now(), actionName, previewId, formattedArgs, inherited }]
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
