import type { ReactNode } from 'react'
import type { SnippetMap, UIRegistry } from '@/types.js'
import { SnippetContextProvider } from '@react/entities/snippets/index.js'
import { RegistryContextProvider } from '../model/context.js'

export interface RegistryProviderProps {
	/** Generated component registry — import from `./ui-registry.gen`. */
	registry?: UIRegistry
	/** Generated snippet source map — import `snippets` from `./snippets.gen`. */
	snippets?: SnippetMap
	children: ReactNode
}

const EMPTY_REGISTRY: UIRegistry = {}
const EMPTY_SNIPPETS: SnippetMap = {}

export function RegistryProvider({ registry, snippets, children }: RegistryProviderProps) {
	return (
		<RegistryContextProvider value={registry ?? EMPTY_REGISTRY}>
			<SnippetContextProvider value={snippets ?? EMPTY_SNIPPETS}>
				{children}
			</SnippetContextProvider>
		</RegistryContextProvider>
	)
}
