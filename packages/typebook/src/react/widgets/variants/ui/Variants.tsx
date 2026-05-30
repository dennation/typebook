import { createElement, useCallback } from 'react'
import { resolveVariantConfig } from '@/resolve.js'
import type { ComponentHandle, MissingProps, VariantConfig } from '@/types.js'
import { useComponentMeta } from '@react/entities/component-meta/index.js'
import { PreviewFrame } from '@react/shared/ui/preview/index.js'
import { getGridStyle } from '@react/shared/lib/getGridStyle.js'

export type VariantsProps<Props extends object, Defaulted extends keyof Props> = {
	of: ComponentHandle<Props, Defaulted>
	items: VariantConfig
	columns?: number
	isolate?: boolean
} & (
	keyof MissingProps<Props, Defaulted> extends never
		? { props?: Partial<Props> }
		: { props: Partial<Props> & MissingProps<Props, Defaulted> }
)

export function Variants<Props extends object, Defaulted extends keyof Props = never>(
	{ of, items, props, columns, isolate }: VariantsProps<Props, Defaulted>,
) {
	const Component = of.component
	const meta = useComponentMeta(of.id)

	const baseProps: Record<string, unknown> = {
		...of.defaultProps,
		...(props as Record<string, unknown> | undefined),
	}

	const variants = resolveVariantConfig(items, meta?.props ?? [], baseProps)
	const render = useCallback((p: any) => createElement(Component, p), [Component])

	return (
		<div style={getGridStyle(variants.length, columns)}>
			{variants.map((v) => (
				<PreviewFrame
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
