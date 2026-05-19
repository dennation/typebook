import { useCallback, useEffect, useMemo, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { InspectedData } from '../context.js'
import { useStudioMeta, useStudioWrapper } from '../context.js'
import { useActionLog } from '../hooks/useActionLog.js'
import { actionStore } from '../../action.js'
import { wrapActionProps } from '../utils/wrapActionProps.js'
import { generateJsx } from '../utils/generateJsx.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { IsolateWrapper } from './IframePreview.js'
import { CodePreview } from './CodePreview.js'
import { SectionHeader, PropsTable, LogEntryRow, FilterDropdown } from './inspectUtils.js'
import { CENTERED_CONTENT_STYLE } from '../styles/constants.js'

export interface InspectModalProps {
	data: InspectedData
	onClose: () => void
}

export function InspectModal({ data, onClose }: InspectModalProps) {
	const { previewId, component, props, render, isolate, trackActions } = data
	const metaMap = useStudioMeta()
	const storyWrapper = useStudioWrapper()
	const meta = metaMap.get(component)
	const componentName = meta?.componentName ?? 'Component'
	const propInfos = meta?.props

	// --- Live component preview ---
	const wrappedProps = trackActions ? wrapActionProps(props, previewId, propInfos) : props
	const content = storyWrapper
		? storyWrapper(() => render(wrappedProps) as any)
		: render(wrappedProps)

	// --- Code preview ---
	const code = useMemo(() => generateJsx(componentName, props), [componentName, props])

	// --- Action log ---
	const entries = useActionLog(previewId)
	const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(new Map())

	const actionNames = useMemo(() => {
		const map = new Map<string, boolean>()
		if (propInfos) {
			for (const info of propInfos) {
				if (info.type.kind === 'function') {
					map.set(info.name, info.inherited ?? false)
				}
			}
		}
		for (const entry of entries) {
			if (!map.has(entry.actionName)) {
				map.set(entry.actionName, entry.inherited)
			}
		}
		return map
	}, [propInfos, entries])

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

	// --- Keyboard & scroll lock ---
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', handleKeyDown)
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = ''
		}
	}, [onClose])

	return (
		<div className="st:fixed st:inset-0 st:z-50 st:bg-bg st:flex st:flex-col">
			{/* Header */}
			<div className="st:flex st:items-center st:justify-between st:px-4 st:py-3 st:border-b st:border-border st:shrink-0">
				<span className="st:text-sm st:font-semibold st:text-text">
					{componentName}
					<span className="st:text-text-muted st:font-normal"> / {previewId}</span>
				</span>
				<button
					type="button"
					onClick={onClose}
					className="st:w-7 st:h-7 st:flex st:items-center st:justify-center st:rounded st:text-text-muted hover:st:text-text hover:st:bg-bg-sidebar st:cursor-pointer st:border-0 st:bg-transparent st:text-base"
					title="Close (Esc)"
				>
					&#10005;
				</button>
			</div>

			{/* Main area: preview + right panel */}
			<div className="st:flex-1 st:flex st:overflow-hidden">
				{/* Left: Live component preview */}
				<div className="st:flex-1 st:overflow-auto st:border-r st:border-border">
					<IsolateWrapper isolate={isolate}>
						<div style={CENTERED_CONTENT_STYLE} className="st:p-8 st:min-h-full">
							<ErrorBoundary>{content}</ErrorBoundary>
						</div>
					</IsolateWrapper>
				</div>

				{/* Right: Props + Code */}
				<div className="st:w-[320px] st:shrink-0 st:flex st:flex-col st:overflow-hidden st:bg-bg-sidebar">
					<Group orientation="vertical" className="st:flex-1 st:overflow-hidden">
						<Panel defaultSize={50} minSize={20} style={{ minHeight: 36 }} className="st:flex st:flex-col st:overflow-hidden">
							<SectionHeader title="Props" />
							<div className="st:flex-1 st:overflow-y-auto st:px-4 st:pb-3 st:pt-2">
								<PropsTable props={props} />
							</div>
						</Panel>

						<Separator className="st:h-px st:bg-border hover:st:bg-accent st:transition-colors st:cursor-row-resize" />

						<Panel defaultSize={50} minSize={20} style={{ minHeight: 36 }} className="st:flex st:flex-col st:overflow-hidden">
							<SectionHeader title="Code" />
							<div className="st:flex-1 st:overflow-y-auto">
								<CodePreview code={code} />
							</div>
						</Panel>
					</Group>
				</div>
			</div>

			{/* Bottom: Action log */}
			<div className="st:border-t st:border-border st:shrink-0 st:bg-bg-sidebar st:max-h-[200px] st:flex st:flex-col">
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
			</div>
		</div>
	)
}
