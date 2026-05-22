import { createElement, useCallback } from 'react'
import { resolveVariantConfig } from '../../resolve.js'
import type { MissingProps, Registration, VariantConfig } from '../../types.js'
import { useRegistration } from '../hooks/useRegistration.js'
import { getGridStyle } from '../utils/getGridStyle.js'
import { PreviewCard } from './PreviewCard.js'

export type VariantsStoryProps<Props, CoveredByDefaults extends keyof Props> = {
	of: Registration<Props, CoveredByDefaults>
	items: VariantConfig
	columns?: number
	isolate?: boolean
} & (
	keyof MissingProps<Props, CoveredByDefaults> extends never
		? { props?: Partial<Props> }
		: { props: Partial<Props> & MissingProps<Props, CoveredByDefaults> }
)

export function VariantsStory<Props, CoveredByDefaults extends keyof Props = never>(
	{ of, items, props, columns, isolate }: VariantsStoryProps<Props, CoveredByDefaults>,
) {
	const { Component, propInfos, defaultProps } = useRegistration(of)

	const baseProps: Record<string, unknown> = {
		...defaultProps,
		...(props as Record<string, unknown> | undefined),
	}

	const variants = resolveVariantConfig(items, propInfos, baseProps)
	const render = useCallback((p: any) => createElement(Component, p), [Component])

	return (
		<div style={getGridStyle(variants.length, columns)}>
			{variants.map((v) => (
				<PreviewCard
					key={v.label}
					label={v.label}
					props={v.props}
					render={render}
					isolate={isolate}
				/>
			))}
		</div>
	)
}
