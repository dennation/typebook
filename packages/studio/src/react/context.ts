import { createContext, useContext } from 'react'
import type { ComponentType } from 'react'
import type { PropInfo } from '../types.js'

type PropsMap = Map<ComponentType<any>, PropInfo[]>

const StudioMetaContext = createContext<PropsMap>(new Map())

export const StudioMetaProvider = StudioMetaContext.Provider

export function useStudioMeta(): PropsMap {
	return useContext(StudioMetaContext)
}
