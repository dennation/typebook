import type { ReactNode } from 'react'
import type { SnippetMap, UIRegistry } from '@/types.js'
import { RegistryContextProvider } from '@react/entities/component-meta/index.js'
import { SnippetContextProvider } from '@react/entities/snippets/index.js'

export interface TypebookProviderProps {
	/** Generated component registry — import from `./ui-registry.gen`. */
	registry?: UIRegistry
	/** Generated snippet source map — import `snippets` from `./snippets.gen`. */
	snippets?: SnippetMap
	children: ReactNode
}

const EMPTY_REGISTRY: UIRegistry = {}
const EMPTY_SNIPPETS: SnippetMap = {}

/**
 * Root provider for typebook's generated data. Pure context — it wires the
 * component registry and snippet sources into React context, nothing else.
 * Routing and history remain the consumer's responsibility.
 */
export function TypebookProvider({ registry, snippets, children }: TypebookProviderProps) {
	return (
		<RegistryContextProvider value={registry ?? EMPTY_REGISTRY}>
			<SnippetContextProvider value={snippets ?? EMPTY_SNIPPETS}>
				{children}
			</SnippetContextProvider>
		</RegistryContextProvider>
	)
}
