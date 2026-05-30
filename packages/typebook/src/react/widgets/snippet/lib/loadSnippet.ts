import { DEFAULT_SNIPPET_URL_BASE, SNIPPET_FILE_EXT } from '@/constants.js'

/** Module-level cache so re-opening a snippet (or remounting) never re-fetches. */
const cache = new Map<string, Promise<string>>()

/** Build the URL a snippet's extracted source is served from. */
export function snippetUrl(name: string, basePath: string = DEFAULT_SNIPPET_URL_BASE): string {
	const base = basePath.replace(/\/$/, '')
	return `${base}/${name}${SNIPPET_FILE_EXT}`
}

/**
 * Fetch the extracted source for `name`, memoized by URL. Rejects (and forgets
 * the cache entry, so a later retry can succeed) on a non-2xx response.
 */
export function loadSnippet(name: string, basePath?: string): Promise<string> {
	const url = snippetUrl(name, basePath)
	let pending = cache.get(url)
	if (!pending) {
		pending = fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to load snippet "${name}" (${res.status} ${res.statusText})`)
				return res.text()
			})
			.catch((err) => {
				cache.delete(url)
				throw err
			})
		cache.set(url, pending)
	}
	return pending
}
