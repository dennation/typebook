import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { LOG_PREFIX } from '@/constants.js'
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
 * Detects a nested `<TypebookProvider>`. The registry and snippet sources are a
 * single global namespace (ids/names are unique across the whole project), so a
 * nested provider fully *shadows* the outer one for its subtree rather than
 * merging — almost always a mistake. Default `false` = no provider above.
 */
const NestingContext = createContext(false)

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Root provider for typebook's generated data. Pure context — it wires the
 * component registry and snippet sources into React context, nothing else.
 * Routing and history remain the consumer's responsibility.
 */
export function TypebookProvider({ registry, snippets, children }: TypebookProviderProps) {
	const nested = useContext(NestingContext)
	useEffect(() => {
		if (isDev && nested) {
			console.warn(
				LOG_PREFIX,
				'Nested <TypebookProvider> detected. The registry and snippet sources are a ' +
					'single global namespace (ids are unique across the whole project); a nested ' +
					'provider fully shadows the outer one for its subtree rather than merging with ' +
					'it. Use a single <TypebookProvider> at the root.',
			)
		}
	}, [nested])

	return (
		<NestingContext.Provider value={true}>
			<RegistryContextProvider value={registry ?? EMPTY_REGISTRY}>
				<SnippetContextProvider value={snippets ?? EMPTY_SNIPPETS}>
					{children}
				</SnippetContextProvider>
			</RegistryContextProvider>
		</NestingContext.Provider>
	)
}
