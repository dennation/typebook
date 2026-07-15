import type { ComponentDoc } from "../types";
import type { TypeScriptClient } from "./ts-client";

/**
 * Scan the given files for exported React components and extract a {@link ComponentDoc} for each —
 * the single source of truth every consuming plugin reads (instructions, stories, …). Files come
 * from the `components` config (resolved from globs by the caller); each file's exports are
 * inspected by type, so no `getComponentMeta` wrapper is required.
 *
 * The same component reachable from several files (re-exports) collapses to one entry, keyed by its
 * declaring file + name. Runs whole every time (build once, dev on change) so the result is complete.
 */
export async function collectComponentDocs(
	client: TypeScriptClient,
	files: string[],
): Promise<ComponentDoc[]> {
	const docs: ComponentDoc[] = [];
	const seen = new Set<string>();
	for (const file of files) {
		for (const doc of await client.getExportedComponentDocs(file)) {
			const key = `${doc.file} ${doc.name}`;
			if (seen.has(key)) continue;
			seen.add(key);
			docs.push(doc);
		}
	}
	return docs;
}
