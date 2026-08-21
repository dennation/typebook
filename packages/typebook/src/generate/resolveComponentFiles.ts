import { globSync } from "tinyglobby";

/**
 * The `components` config (a path, list, or globs) resolved to an absolute file list.
 *
 * **Sorted** — the order decides which module wins when the same component is reachable from
 * several files (the scan keys by declaring file + name and keeps the first), so an unsorted,
 * filesystem-dependent order would make the output differ between machines and between runs.
 * Sorting by code unit (not locale) keeps it stable across platforms.
 */
export function resolveComponentFiles(
	root: string,
	patterns: string | string[] | undefined,
): string[] {
	if (patterns == null) return [];
	return globSync(Array.isArray(patterns) ? patterns : [patterns], {
		cwd: root,
		absolute: true,
	}).sort();
}
