/**
 * Shared oxc-parser helpers used by both the registerComponent() scanner and
 * the <Snippet> scanner. oxc returns an ESTree-compatible AST with `start` /
 * `end` character offsets on every node, which is what makes 1:1 source slicing
 * possible.
 */

/** ESTree-compatible program node returned by oxc (loosely typed — walked structurally). */
export type Program = Record<string, unknown>;

/** Parse a TypeScript/JSX file into an ESTree-compatible program node. */
export async function parseProgram(
	filename: string,
	content: string,
): Promise<Program> {
	const oxc = await import("oxc-parser");
	return oxc.parseSync(filename, content).program as unknown as Program;
}

/**
 * Depth-first AST walk. Visits every object node in the tree (skips primitives,
 * arrays are descended into). Cheap enough for source files — no cycle handling
 * needed since oxc returns a tree, not a graph.
 */
export function walk(
	root: unknown,
	visit: (node: Record<string, unknown>) => void,
): void {
	const stack: unknown[] = [root];
	while (stack.length > 0) {
		const current = stack.pop();
		if (current === null || typeof current !== "object") continue;

		if (Array.isArray(current)) {
			for (let i = current.length - 1; i >= 0; i--) stack.push(current[i]);
			continue;
		}

		const node = current as Record<string, unknown>;
		if (typeof node.type === "string") visit(node);

		for (const key in node) {
			if (
				key === "type" ||
				key === "start" ||
				key === "end" ||
				key === "loc" ||
				key === "range"
			)
				continue;
			const value = node[key];
			if (value && typeof value === "object") stack.push(value);
		}
	}
}
