import type { ReactNode } from 'react'
import type { UIRegistry } from '@/types.js'
import { RegistryContextProvider } from '../model/context.js'

export interface RegistryProviderProps {
	registry?: UIRegistry
	children: ReactNode
}

const EMPTY_REGISTRY: UIRegistry = {}

export function RegistryProvider({ registry, children }: RegistryProviderProps) {
	return (
		<RegistryContextProvider value={registry ?? EMPTY_REGISTRY}>
			{children}
		</RegistryContextProvider>
	)
}
