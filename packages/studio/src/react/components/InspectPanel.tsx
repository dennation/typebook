import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { actionStore } from '../../action.js'
import type { ActionLogEntry } from '../../action.js'
import { useInspect } from '../context.js'
import { useActionLog } from '../hooks/useActionLog.js'
import { generateJsx } from '../utils/generateJsx.js'
import { CodePreview } from './CodePreview.js'

export interface InspectPanelProps {
	previewId: string
	onClose: () => void
}

export function InspectPanel({ previewId, onClose }: InspectPanelProps) {
	const inspect = useInspect()
	const entries = useActionLog(previewId)
	const previewProps = inspect?.previewPropsRef.current?.get(previewId) ?? {}
	const componentName = inspect?.previewComponentNamesRef.current?.get(previewId) ?? 'Component'
	const code = useMemo(() => generateJsx(componentName, previewProps), [componentName, previewProps])

	const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(new Map())

	// Build full action names list from PropInfo (available immediately) + logged entries
	const actionNames = useMemo(() => {
		const map = new Map<string, boolean>()
		const propInfos = inspect?.previewPropInfosRef.current?.get(previewId)
		if (propInfos) {
			for (const info of propInfos) {
				if (info.type.kind === 'function') {
					map.set(info.name, info.inherited ?? false)
				}
			}
		}
		// Merge any logged actions not in PropInfo (e.g. dynamic props)
		for (const entry of entries) {
			if (!map.has(entry.actionName)) {
				map.set(entry.actionName, entry.inherited)
			}
		}
		return map
	}, [inspect?.previewPropInfosRef, previewId, entries])

	const isVisible = useCallback(
		(name: string) => overrides.get(name) ?? !(actionNames.get(name) ?? false),
		[overrides, actionNames],
	)

	const filteredEntries = useMemo(
		() => entries.filter((e) => isVisible(e.actionName)),
		[entries, isVisible],
	)

	const hiddenCount = useMemo(() => {
		let count = 0
		for (const [name] of actionNames) {
			if (!isVisible(name)) count++
		}
		return count
	}, [actionNames, isVisible])

	const handleToggle = useCallback((name: string, visible: boolean) => {
		setOverrides((prev) => {
			const next = new Map(prev)
			next.set(name, visible)
			return next
		})
	}, [])

	const handleToggleAll = useCallback((visible: boolean) => {
		setOverrides((prev) => {
			const next = new Map(prev)
			for (const [name] of actionNames) {
				next.set(name, visible)
			}
			return next
		})
	}, [actionNames])

	const handleClear = useCallback(() => {
		actionStore.clear(previewId)
	}, [previewId])

	return (
		<aside className="st:bg-bg-sidebar st:flex st:flex-col st:overflow-hidden st:h-full">
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
				<Panel defaultSize={35} minSize={15} className="st:flex st:flex-col st:overflow-hidden">
					<SectionHeader title="Props" />
					<div className="st:flex-1 st:overflow-y-auto st:px-4 st:pb-3">
						<PropsTable props={previewProps} />
					</div>
				</Panel>

				<Separator className="st:h-px st:bg-border hover:st:bg-accent st:transition-colors st:cursor-row-resize" />

				{/* Code section */}
				<Panel defaultSize={30} minSize={15} className="st:flex st:flex-col st:overflow-hidden">
					<SectionHeader title="Code" />
					<div className="st:flex-1 st:overflow-y-auto">
						<CodePreview code={code} />
					</div>
				</Panel>

				<Separator className="st:h-px st:bg-border hover:st:bg-accent st:transition-colors st:cursor-row-resize" />

				{/* Log section */}
				<Panel defaultSize={35} minSize={15} className="st:flex st:flex-col st:overflow-hidden">
					<SectionHeader title="Log" count={filteredEntries.length}>
						<div className="st:flex st:items-center st:gap-1">
							{entries.length > 0 && (
								<button
									type="button"
									onClick={handleClear}
									className="st:text-[10px] st:text-text-muted hover:st:text-text st:cursor-pointer st:bg-transparent st:border-0 st:px-1"
								>
									Clear
								</button>
							)}
							{actionNames.size > 0 && (
								<FilterDropdown
									actionNames={actionNames}
									isVisible={isVisible}
									hiddenCount={hiddenCount}
									onToggle={handleToggle}
									onToggleAll={handleToggleAll}
								/>
							)}
						</div>
					</SectionHeader>

					{filteredEntries.length === 0 ? (
						<p className="st:text-xs st:text-text-muted st:px-4 st:py-3">
							{entries.length === 0 ? 'No actions logged' : 'All actions filtered'}
						</p>
					) : (
						<div className="st:flex-1 st:overflow-y-auto st:px-4 st:pb-3 st:space-y-0.5">
							{filteredEntries.map((entry) => (
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

function FilterDropdown({
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
				<div className="st:absolute st:right-0 st:top-full st:mt-1 st:bg-bg-sidebar st:border st:border-border st:rounded st:shadow-lg st:z-50 st:min-w-[160px] st:max-h-[240px] st:overflow-y-auto st:py-1">
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
