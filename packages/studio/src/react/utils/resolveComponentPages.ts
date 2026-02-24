import type { ComponentType } from 'react'
import type { ComponentEntry, PageResult } from '../../types.js'
import { DEFAULT_DOCS_PAGE } from '../../constants.js'
import { entryName } from './naming.js'

export interface ResolvedPages {
	componentPages: Map<ComponentEntry, PageResult[]>
	topLevelPages: PageResult[]
}

/** Compute the override path for a component's docs page */
export function docsPagePath(entry: ComponentEntry): string {
	const name = entryName(entry)
	const path = entry.config.path
	return path ? `${path}/${name}` : name
}

/**
 * Resolves component-associated pages (auto-generated docs + user overrides)
 * and separates them from top-level pages.
 *
 * For each component (where autoDocs !== false):
 * 1. Check if a user page overrides the default (name === DEFAULT_DOCS_PAGE, path === componentFullPath)
 * 2. If override found → use it and remove from top-level pages
 * 3. If no override → auto-generate a docs page with the provided content factory
 */
export function resolveComponentPages(
	components: ComponentEntry[],
	userPages: PageResult[],
	createDocsContent: (entry: ComponentEntry) => ComponentType,
): ResolvedPages {
	const componentPages = new Map<ComponentEntry, PageResult[]>()
	const consumedPageIndices = new Set<number>()

	for (const entry of components) {
		if (entry.config.autoDocs === false) continue

		const fullPath = docsPagePath(entry)

		// Check for user override: page with matching name and path
		const overrideIndex = userPages.findIndex(
			(p) => p.name === DEFAULT_DOCS_PAGE && p.path === fullPath,
		)

		if (overrideIndex !== -1) {
			// User provided their own docs page — use it, remove from top-level
			componentPages.set(entry, [userPages[overrideIndex]])
			consumedPageIndices.add(overrideIndex)
		} else {
			// Auto-generate default docs page
			componentPages.set(entry, [
				{
					__type: 'page',
					name: DEFAULT_DOCS_PAGE,
					order: -1,
					content: createDocsContent(entry),
				},
			])
		}
	}

	const topLevelPages = userPages.filter((_, i) => !consumedPageIndices.has(i))
	return { componentPages, topLevelPages }
}
