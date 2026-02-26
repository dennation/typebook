import { useState, useCallback, useInsertionEffect, useMemo, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import type { Registry, ComponentEntry, ComponentMeta, WrapperFn } from '../../types.js'
import { STYLE_ELEMENT_ID } from '../../constants.js'
import { buildSidebarTree } from '../utils/buildSidebarTree.js'
import { resolveComponentPages } from '../utils/resolveComponentPages.js'
import { entryName } from '../utils/naming.js'
import { useHashRoute } from '../hooks/useHashRoute.js'
import { useTheme, type Theme } from '../hooks/useTheme.js'
import { StudioMetaProvider, StudioWrapperProvider, InspectProvider, CodeThemeProvider, DEFAULT_CODE_THEME, type PreviewPropsMap, type PreviewPropInfosMap, type PreviewComponentNamesMap, type CodeThemeConfig } from '../context.js'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Sidebar } from './Sidebar.js'
import { MainContent } from './MainContent.js'
import { InspectPanel } from './InspectPanel.js'
import { Playground } from './Playground.js'
import styles from '../styles/styles.css?inline'

export interface StudioProps {
	registry: Registry
	theme?: Theme
	disableSearch?: boolean
	/** Global wrapper applied to all stories and Playground previews (e.g. a theme provider) */
	storyWrapper?: WrapperFn
	/** Shiki themes for code preview in Inspect Panel. Defaults to github-light / github-dark. */
	codeTheme?: { light?: string; dark?: string }
}

export function Studio({ registry, theme: themeOverride, disableSearch = false, storyWrapper, codeTheme }: StudioProps) {
	const { components, pages = [] } = registry
	const { theme, toggleTheme } = useTheme(themeOverride)
	const [searchQuery, setSearchQuery] = useState('')
	const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

	// --- Inspect panel state ---
	const [inspectedPreviewId, setInspectedPreviewId] = useState<string | null>(null)
	const previewPropsRef = useRef<PreviewPropsMap>(new Map())
	const previewPropInfosRef = useRef<PreviewPropInfosMap>(new Map())
	const previewComponentNamesRef = useRef<PreviewComponentNamesMap>(new Map())

	const handleInspect = useCallback((id: string) => {
		setInspectedPreviewId((prev) => (prev === id ? null : id))
	}, [])

	const handleCloseInspect = useCallback(() => {
		setInspectedPreviewId(null)
	}, [])

	// Component → ComponentMeta map for cross-file story resolution
	const metaMap = useMemo(() => {
		const map = new Map<ComponentType<any>, ComponentMeta>()
		for (const entry of components) {
			if (entry.meta) {
				map.set(entry.config.component, entry.meta)
			}
		}
		return map
	}, [components])

	// Resolve component pages (auto-generated docs + user overrides)
	const { componentPages, topLevelPages } = useMemo(
		() =>
			resolveComponentPages(components, pages, (entry) => {
				const DocsContent = () => <Playground of={entry.config} />
				DocsContent.displayName = `${entryName(entry)}Docs`
				return DocsContent
			}),
		[components, pages],
	)

	const route = useHashRoute(components, topLevelPages, componentPages)

	// Clear inspect panel on navigation
	useEffect(() => {
		setInspectedPreviewId(null)
	}, [route.activeView])

	const toggleCollapse = useCallback((key: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}, [])

	// Filter components and pages by search query
	const { filtered, filteredPages } = useMemo(() => {
		if (!searchQuery) return { filtered: components, filteredPages: topLevelPages }
		const q = searchQuery.toLowerCase()
		const filtered = components.filter((e) => {
			const matchesComponent = [
				e.config.name,
				e.config.component.displayName,
				e.config.component.name,
				e.config.path,
			]
				.filter(Boolean)
				.some((s) => s!.toLowerCase().includes(q))
			const matchesStory = Object.keys(e.stories).some((s) => s.toLowerCase().includes(q))
			return matchesComponent || matchesStory
		})
		const filteredPages = topLevelPages.filter(
			(p) => p.name.toLowerCase().includes(q) || (p.path?.toLowerCase().includes(q) ?? false),
		)
		return { filtered, filteredPages }
	}, [components, topLevelPages, searchQuery])

	// Build sidebar tree from paths
	const tree = useMemo(
		() => buildSidebarTree(filtered, filteredPages, componentPages),
		[filtered, filteredPages, componentPages],
	)

	// Derive active component name from route.activeView
	const activeComponentName = route.activeView && 'component' in route.activeView ? route.activeView.component : null

	// Find active entry
	const activeEntry = useMemo(
		() => components.find((e) => entryName(e) === activeComponentName),
		[components, activeComponentName],
	)

	// Active story data
	const activeStoryName = route.activeView?.type === 'story' ? route.activeView.story : null

	const story = useMemo(
		() => (activeEntry && activeStoryName ? (activeEntry.stories[activeStoryName] ?? null) : null),
		[activeEntry, activeStoryName],
	)

	const storyProps = useMemo(() => {
		if (!story || !activeEntry) return []
		return story.component === activeEntry.config.component
			? (activeEntry.meta?.props ?? [])
			: (metaMap.get(story.component)?.props ?? [])
	}, [story, activeEntry, metaMap])

	// Find active page content — either top-level page or component page
	const PageContent = useMemo((): ComponentType | null => {
		const view = route.activeView
		if (view?.type === 'componentPage' && activeEntry) {
			const entryPages = componentPages.get(activeEntry)
			const page = entryPages?.find((p) => p.name === view.page)
			return page?.content ?? null
		}
		if (view?.type === 'page') {
			const page = topLevelPages.find((p) => p.name === view.name)
			return page?.content ?? null
		}
		return null
	}, [route.activeView, activeEntry, topLevelPages, componentPages])

	// Inject styles before first paint to prevent FOUC
	useInsertionEffect(() => {
		if (document.getElementById(STYLE_ELEMENT_ID)) return
		const style = document.createElement('style')
		style.id = STYLE_ELEMENT_ID
		style.textContent = styles
		document.head.appendChild(style)
	}, [])

	// Inspect context value
	const inspectState = useMemo(
		() => ({ inspectedPreviewId, onInspect: handleInspect, previewPropsRef, previewPropInfosRef, previewComponentNamesRef }),
		[inspectedPreviewId, handleInspect],
	)

	const rootClass = 'st:grid st:grid-cols-[260px_minmax(0,1fr)] st:h-screen st:m-0 st:p-0 st:box-border st:font-sans st:bg-bg st:text-text'

	const resolvedCodeTheme = useMemo<CodeThemeConfig>(
		() => ({
			light: codeTheme?.light ?? DEFAULT_CODE_THEME.light,
			dark: codeTheme?.dark ?? DEFAULT_CODE_THEME.dark,
		}),
		[codeTheme?.light, codeTheme?.dark],
	)

	return (
		<StudioMetaProvider value={metaMap}>
			<StudioWrapperProvider value={storyWrapper}>
				<CodeThemeProvider value={resolvedCodeTheme}>
					<InspectProvider value={inspectState}>
						<div className={rootClass} data-theme={theme}>
							<Sidebar
								tree={tree}
								route={route}
								collapsed={collapsed}
								toggleCollapse={toggleCollapse}
								disableSearch={disableSearch}
								searchQuery={searchQuery}
								onSearchChange={setSearchQuery}
								theme={theme}
								onToggleTheme={toggleTheme}
							/>

							{inspectedPreviewId ? (
								<Group orientation="horizontal" className="st:overflow-hidden">
									<Panel minSize={40}>
										<MainContent
											activeEntry={activeEntry}
											storyName={activeStoryName}
											story={story}
											storyProps={storyProps}
											PageContent={PageContent}
										/>
									</Panel>
									<Separator className="st:w-px st:bg-border hover:st:bg-accent st:transition-colors st:cursor-col-resize" />
									<Panel defaultSize={30} minSize={20}>
										<InspectPanel
											previewId={inspectedPreviewId}
											onClose={handleCloseInspect}
										/>
									</Panel>
								</Group>
							) : (
								<MainContent
									activeEntry={activeEntry}
									storyName={activeStoryName}
									story={story}
									storyProps={storyProps}
									PageContent={PageContent}
								/>
							)}
						</div>
					</InspectProvider>
				</CodeThemeProvider>
			</StudioWrapperProvider>
		</StudioMetaProvider>
	)
}
