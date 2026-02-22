import type { ComponentEntry, PageEntry } from '../../types.js'

export function toKebabCase(str: string): string {
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

/** Get display name for a component entry */
export function entryName(entry: ComponentEntry): string {
	return (
		entry.config.name ??
		entry.config.component.displayName ??
		entry.config.component.name ??
		'Unknown'
	)
}

/** Get display name for a page entry */
export function pageName(entry: PageEntry): string {
	return entry.page.name
}
