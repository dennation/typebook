import { createContext, useContext } from 'react'
import type { UIRegistry } from '@/types.js'

const RegistryContext = createContext<UIRegistry>({})

export const RegistryContextProvider = RegistryContext.Provider

export function useRegistry(): UIRegistry {
	return useContext(RegistryContext)
}
