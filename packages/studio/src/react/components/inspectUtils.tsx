import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ActionLogEntry } from '../../action.js'

// --- Formatters ---

export function formatValue(value: unknown): string {
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
			return `[${(value as any).constructor?.name ?? 'object'}]`
		}
	}
	return String(value)
}

export function formatTime(timestamp: number): string {
	const d = new Date(timestamp)
	const h = String(d.getHours()).padStart(2, '0')
	const m = String(d.getMinutes()).padStart(2, '0')
	const s = String(d.getSeconds()).padStart(2, '0')
	const ms = String(d.getMilliseconds()).padStart(3, '0')
	return `${h}:${m}:${s}.${ms}`
}

// --- Sub-components ---

export function SectionHeader({
	title,
	count,
	children,
}: {
	title: string
	count?: number
	children?: ReactNode
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

export function PropsTable({ props }: { props: Record<string, unknown> }) {
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

export function LogEntryRow({ entry }: { entry: ActionLogEntry }) {
	return (
		<div className="st:text-[11px] st:font-mono st:py-0.5 st:flex st:gap-2">
			<span className="st:text-text-muted st:shrink-0">
				{formatTime(entry.timestamp)}
			</span>
			<span className="st:text-accent st:shrink-0">{entry.actionName}</span>
			{entry.formattedArgs && (
				<span className="st:text-text-muted st:truncate" title={entry.formattedArgs}>
					{entry.formattedArgs}
				</span>
			)}
		</div>
	)
}

export function FilterDropdown({
	actionNames,
	isVisible,
	hiddenCount,
	onToggle,
	onToggleAll,
}: {
	actionNames: ReadonlyMap<string, boolean>
	isVisible: (name: string) => boolean
	hiddenCount: number
	onToggle: (name: string, visible: boolean) => void
	onToggleAll: (visible: boolean) => void
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [open])

	const sorted = useMemo(() => {
		const entries = Array.from(actionNames.entries())
		return entries.sort((a, b) => {
			// Own first, inherited second
			if (a[1] !== b[1]) return a[1] ? 1 : -1
			return a[0].localeCompare(b[0])
		})
	}, [actionNames])

	return (
		<div ref={ref} className="st:relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={`st:text-[10px] st:cursor-pointer st:bg-transparent st:border-0 st:px-1 st:flex st:items-center st:gap-0.5 ${
					hiddenCount > 0
						? 'st:text-accent'
						: 'st:text-text-muted hover:st:text-text'
				}`}
				title="Filter actions"
			>
				&#9698;
				{hiddenCount > 0 && (
					<span className="st:text-[9px] st:bg-accent st:text-white st:rounded-full st:w-3.5 st:h-3.5 st:flex st:items-center st:justify-center st:leading-none">
						{hiddenCount}
					</span>
				)}
			</button>

			{open && (
				<div className="st:absolute st:right-0 st:bottom-full st:mb-1 st:bg-bg-sidebar st:border st:border-border st:rounded st:shadow-lg st:z-50 st:min-w-[160px] st:max-h-[240px] st:overflow-y-auto st:py-1">
					<label className="st:flex st:items-center st:gap-2 st:px-3 st:py-1 st:text-[11px] st:font-medium st:text-text st:cursor-pointer hover:st:bg-bg st:border-b st:border-border st:mb-1 st:pb-1.5">
						<input
							type="checkbox"
							checked={hiddenCount === 0}
							onChange={(e) => onToggleAll(e.target.checked)}
							className="st:cursor-pointer"
						/>
						Select all
					</label>
					{sorted.map(([name, inherited]) => (
						<label
							key={name}
							className={`st:flex st:items-center st:gap-2 st:px-3 st:py-1 st:text-[11px] st:font-mono st:cursor-pointer hover:st:bg-bg ${
								inherited ? 'st:text-text-muted' : 'st:text-text'
							}`}
						>
							<input
								type="checkbox"
								checked={isVisible(name)}
								onChange={(e) => onToggle(name, e.target.checked)}
								className="st:cursor-pointer"
							/>
							{name}
						</label>
					))}
				</div>
			)}
		</div>
	)
}
