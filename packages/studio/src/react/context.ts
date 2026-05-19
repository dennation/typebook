import { createContext, useContext } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { ComponentMeta, WrapperFn } from '../types.js'

// --- Studio Meta (Component → ComponentMeta) ---

type MetaMap = Map<ComponentType<any>, ComponentMeta>

const StudioMetaContext = createContext<MetaMap>(new Map())

export const StudioMetaProvider = StudioMetaContext.Provider

export function useStudioMeta(): MetaMap {
	return useContext(StudioMetaContext)
}

// --- Studio Wrapper (global storyWrapper) ---

const StudioWrapperContext = createContext<WrapperFn | undefined>(undefined)

export const StudioWrapperProvider = StudioWrapperContext.Provider

export function useStudioWrapper(): WrapperFn | undefined {
	return useContext(StudioWrapperContext)
}

// --- Code Theme (shiki themes for light/dark) ---

export interface CodeThemeConfig {
	light: string
	dark: string
}

const DEFAULT_CODE_THEME: CodeThemeConfig = { light: 'github-light', dark: 'github-dark' }

const CodeThemeContext = createContext<CodeThemeConfig>(DEFAULT_CODE_THEME)

export const CodeThemeProvider = CodeThemeContext.Provider

export { DEFAULT_CODE_THEME }

export function useCodeTheme(): CodeThemeConfig {
	return useContext(CodeThemeContext)
}

// --- Inspect (modal state) ---

export interface InspectedData {
	readonly previewId: string
	readonly component: ComponentType<any>
	readonly props: Record<string, unknown>
	readonly render: (props: any) => ReactNode
	readonly isolate: boolean
	readonly trackActions: boolean
}

export interface InspectState {
	inspectedPreviewId: string | null
	onInspect: (data: InspectedData) => void
}

const InspectContext = createContext<InspectState | null>(null)

export const InspectProvider = InspectContext.Provider

export function useInspect(): InspectState | null {
	return useContext(InspectContext)
}
