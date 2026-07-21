/**
 * Module-injection primitive shared by the factory and its `transform` sub-plugins. A plugin
 * records insertions (an {@link Edit} = "insert this text at this character offset") against a
 * module it never reparses; the factory collects every plugin's edits and applies them with
 * {@link applyEdits}. Keeping this React-free and bundler-free lets the same seam serve any
 * transform plugin (e.g. `snippets()` injecting `__snippetSource`).
 */

/** A single insertion: put `insert` at character offset `at` in the module source. */
export interface Edit {
	at: number;
	insert: string;
}

/** Apply insertions back-to-front so each edit's offset is unaffected by earlier ones. */
export function applyEdits(code: string, edits: Edit[]): string {
	let out = code;
	for (const edit of [...edits].sort((a, b) => b.at - a.at)) {
		out = out.slice(0, edit.at) + edit.insert + out.slice(edit.at);
	}
	return out;
}
