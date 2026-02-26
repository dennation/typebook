import { useCallback } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { actionStore } from '../../action.js'
import type { ActionLogEntry } from '../../action.js'
import { useInspect } from '../context.js'
import { useActionLog } from '../hooks/useActionLog.js'

export interface InspectPanelProps {
	previewId: string
	onClose: () => void
}

export function InspectPanel({ previewId, onClose }: InspectPanelProps) {
	const inspect = useInspect()
	const entries = useActionLog(previewId)
	const previewProps = inspect?.previewPropsRef.current?.get(previewId) ?? {}

	const handleClear = useCallback(() => {
		actionStore.clear(previewId)
	}, [previewId])

	return (
		<aside className="st:bg-bg-sidebar st:border-l st:border-border st:flex st:flex-col st:overflow-hidden st:h-full">
			{/* Header */}
			<div className="st:flex st:items-center st:justify-between st:px-4 st:py-3 st:border-b st:border-border st:shrink-0">
				<span className="st:text-sm st:font-semibold st:text-text">Inspect</span>
				<button
					type="button"
					onClick={onClose}
					className="st:w-6 st:h-6 st:rounded st:text-text-muted hover:st:text-text st:flex st:items-center st:justify-center st:cursor-pointer st:border-0 st:bg-transparent"
					title="Close"
				>
					&#10005;
				</button>
			</div>

			{/* Resizable sections */}
			<Group orientation="vertical" className="st:flex-1 st:overflow-hidden">
				{/* Props section */}
				<Panel defaultSize={50} minSize={20} className="st:flex st:flex-col st:overflow-hidden">
					<SectionHeader title="Props" />
					<div className="st:flex-1 st:overflow-y-auto st:px-4 st:pb-3">
						<PropsTable props={previewProps} />
					</div>
				</Panel>

				<Separator className="st:h-px st:bg-border hover:st:bg-accent st:transition-colors st:cursor-row-resize" />

				{/* Log section */}
				<Panel defaultSize={50} minSize={20} className="st:flex st:flex-col st:overflow-hidden">
					<SectionHeader title="Log" count={entries.length}>
						{entries.length > 0 && (
							<button
								type="button"
								onClick={handleClear}
								className="st:text-[10px] st:text-text-muted hover:st:text-text st:cursor-pointer st:bg-transparent st:border-0 st:px-1"
							>
								Clear
							</button>
						)}
					</SectionHeader>

					{entries.length === 0 ? (
						<p className="st:text-xs st:text-text-muted st:px-4 st:py-3">
							No actions logged
						</p>
					) : (
						<div className="st:flex-1 st:overflow-y-auto st:px-4 st:pb-3 st:space-y-0.5">
							{entries.map((entry) => (
								<LogEntryRow key={entry.id} entry={entry} />
							))}
						</div>
					)}
				</Panel>
			</Group>
		</aside>
	)
}

// --- Sub-components ---

function SectionHeader({
	title,
	count,
	children,
}: {
	title: string
	count?: number
	children?: React.ReactNode
}) {
	return (
		<div className="st:flex st:items-center st:justify-between st:px-4 st:py-2 st:border-b st:border-border st:bg-bg st:shrink-0">
			<span className="st:text-xs st:font-medium st:text-text-muted">
				{title}
				{count != null && count > 0 && (
					<span className="st:ml-1.5 st:text-[10px] st:bg-bg-sidebar st:px-1.5 st:py-px st:rounded-full">
						{count}
					</span>
				)}
			</span>
			{children}
		</div>
	)
}

function LogEntryRow({ entry }: { entry: ActionLogEntry }) {
	const argsPreview = formatArgs(entry.args)

	return (
		<div className="st:text-[11px] st:font-mono st:py-0.5 st:flex st:gap-2">
			<span className="st:text-text-muted st:shrink-0">
				{formatTime(entry.timestamp)}
			</span>
			<span className="st:text-accent st:shrink-0">{entry.actionName}</span>
			{argsPreview && (
				<span className="st:text-text-muted st:truncate" title={argsPreview}>
					{argsPreview}
				</span>
			)}
		</div>
	)
}

function PropsTable({ props }: { props: Record<string, unknown> }) {
	const entries = Object.entries(props)

	if (entries.length === 0) {
		return <p className="st:text-xs st:text-text-muted st:py-2">No props</p>
	}

	return (
		<div className="st:space-y-0.5">
			{entries.map(([key, value]) => (
				<div key={key} className="st:flex st:gap-2 st:text-xs st:py-0.5">
					<span className="st:font-mono st:text-text st:shrink-0">{key}:</span>
					<span className="st:font-mono st:text-text-muted st:truncate" title={formatValue(value)}>
						{formatValue(value)}
					</span>
				</div>
			))}
		</div>
	)
}

// --- Formatters ---

function formatTime(timestamp: number): string {
	const d = new Date(timestamp)
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	const s = String(d.getSeconds()).padStart(2, '0')
	const ms = String(d.getMilliseconds()).padStart(3, '0')
	return `${h}:${m}:${s}.${ms}`
}

function formatArgs(args: readonly unknown[]): string {
	if (args.length === 0) return ''
	return args.map((a) => formatValue(a)).join(', ')
}

function formatValue(value: unknown): string {
	if (value === undefined) return 'undefined'
	if (value === null) return 'null'
	if (typeof value === 'function') {
		return '__actionName' in value ? `action("${(value as any).__actionName}")` : 'fn()'
	}
	if (typeof value === 'object') {
		try {
			const json = JSON.stringify(value)
			return json.length > 80 ? `${json.slice(0, 77)}...` : json
		} catch {
			return '[object]'
		}
	}
	return String(value)
}
