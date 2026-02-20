import type { RegistryEntry } from '../../types.js'

export function toKebabCase(str: string): string {
	return str
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase()
}

/** Get display name for a registry entry */
export function entryName(entry: RegistryEntry): string {
	return (
		entry.config.title ??
		entry.config.component.displayName ??
		entry.config.component.name ??
		'Unknown'
	)
}
