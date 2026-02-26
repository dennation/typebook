import { createContext, useContext } from 'react'
import type { ComponentType, RefObject } from 'react'
import type { ComponentMeta, PropInfo, WrapperFn } from '../types.js'

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

// --- Inspect (right panel state) ---

export type PreviewPropsMap = Map<string, Record<string, unknown>>
export type PreviewPropInfosMap = Map<string, readonly PropInfo[]>
export type PreviewComponentNamesMap = Map<string, string>

export interface InspectState {
	inspectedPreviewId: string | null
	onInspect: (previewId: string) => void
	previewPropsRef: RefObject<PreviewPropsMap>
	previewPropInfosRef: RefObject<PreviewPropInfosMap>
	previewComponentNamesRef: RefObject<PreviewComponentNamesMap>
}

const InspectContext = createContext<InspectState | null>(null)

export const InspectProvider = InspectContext.Provider

export function useInspect(): InspectState | null {
	return useContext(InspectContext)
}
