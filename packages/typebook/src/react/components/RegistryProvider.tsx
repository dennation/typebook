import type { ReactNode } from 'react'
import type { UIRegistry } from '../../types.js'
import { TypebookMetaProvider } from '../context.js'

export interface RegistryProviderProps {
	registry?: UIRegistry
	children: ReactNode
}

const EMPTY_REGISTRY: UIRegistry = {}

export function RegistryProvider({ registry, children }: RegistryProviderProps) {
	return (
		<TypebookMetaProvider value={registry ?? EMPTY_REGISTRY}>
			{children}
		</TypebookMetaProvider>
	)
}
