import { createContext, useContext } from 'react'
import type { UIRegistry } from '../types.js'

const TypebookMetaContext = createContext<UIRegistry>({})

export const TypebookMetaProvider = TypebookMetaContext.Provider

export function useTypebookMeta(): UIRegistry {
	return useContext(TypebookMetaContext)
}
