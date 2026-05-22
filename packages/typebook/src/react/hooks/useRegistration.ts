import type { ComponentType } from 'react'
import type { PropInfo, Registration } from '../../types.js'
import { useTypebookMeta } from '../context.js'

export interface RegistrationMeta {
	Component: ComponentType<any>
	componentName: string
	propInfos: PropInfo[]
	defaultProps: Record<string, unknown>
}

export function useRegistration(of: Registration<any>): RegistrationMeta {
	const uiRegistry = useTypebookMeta()
	const meta = uiRegistry[of.id]
	return {
		Component: of.component,
		componentName: meta?.componentName ?? of.component.displayName ?? of.component.name ?? 'Component',
		propInfos: meta?.props ?? [],
		defaultProps: of.defaultProps,
	}
}
