import type { ComponentType } from 'react'
import type { ComponentMeta, PropInfo, Registration } from '../../types.js'
import { useTypebookMeta } from '../context.js'

export interface RegistrationMeta {
	Component: ComponentType<any>
	componentName: string
	propInfos: PropInfo[]
	defaultProps: Record<string, unknown>
	meta?: ComponentMeta
}

/**
 * Pull everything `<Story>`/`<VariantsStory>`/`<MatrixStory>` need from a `Registration`:
 * the component, its props metadata (looked up by id in the registry), and
 * defaultProps.
 */
export function useRegistration(of: Registration<any>): RegistrationMeta {
	const uiRegistry = useTypebookMeta()
	const meta = uiRegistry[of.id]
	return {
		Component: of.component,
		componentName: meta?.componentName ?? of.component.displayName ?? of.component.name ?? 'Component',
		propInfos: meta?.props ?? [],
		defaultProps: of.defaultProps,
		meta,
	}
}
