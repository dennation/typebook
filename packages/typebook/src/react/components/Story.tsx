import { createElement } from 'react'
import type { MissingProps, Registration } from '../../types.js'
import { useRegistration } from '../hooks/useRegistration.js'
import { PreviewCard } from './PreviewCard.js'

export type StoryProps<Props, CoveredByDefaults extends keyof Props> = {
	of: Registration<Props, CoveredByDefaults>
	isolate?: boolean
} & (
	keyof MissingProps<Props, CoveredByDefaults> extends never
		? { props?: Partial<Props> }
		: { props: Partial<Props> & MissingProps<Props, CoveredByDefaults> }
)

export function Story<Props, CoveredByDefaults extends keyof Props = never>(
	{ of, props, isolate }: StoryProps<Props, CoveredByDefaults>,
) {
	const { Component, defaultProps } = useRegistration(of)

	const merged: Record<string, unknown> = {
		...defaultProps,
		...(props as Record<string, unknown> | undefined),
	}

	return (
		<PreviewCard
			label="default"
			component={Component}
			props={merged}
			render={(p) => createElement(Component, p)}
			isolate={isolate}
		/>
	)
}
