import { createContext, useContext } from 'react'
import type { ComponentType, RefObject } from 'react'
import type { PropInfo, WrapperFn } from '../types.js'

// --- Studio Meta (Component → PropInfo[]) ---

type PropsMap = Map<ComponentType<any>, PropInfo[]>

const StudioMetaContext = createContext<PropsMap>(new Map())

export const StudioMetaProvider = StudioMetaContext.Provider

export function useStudioMeta(): PropsMap {
	return useContext(StudioMetaContext)
}

// --- Studio Wrapper (global storyWrapper) ---

const StudioWrapperContext = createContext<WrapperFn | undefined>(undefined)

export const StudioWrapperProvider = StudioWrapperContext.Provider

export function useStudioWrapper(): WrapperFn | undefined {
	return useContext(StudioWrapperContext)
}

// --- Inspect (right panel state) ---

export type PreviewPropsMap = Map<string, Record<string, unknown>>
export type PreviewPropInfosMap = Map<string, readonly PropInfo[]>

export interface InspectState {
	inspectedPreviewId: string | null
	onInspect: (previewId: string) => void
	previewPropsRef: RefObject<PreviewPropsMap>
	previewPropInfosRef: RefObject<PreviewPropInfosMap>
}

const InspectContext = createContext<InspectState | null>(null)

export const InspectProvider = InspectContext.Provider

export function useInspect(): InspectState | null {
	return useContext(InspectContext)
}
