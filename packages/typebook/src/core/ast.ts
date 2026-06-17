/**
 * Shared oxc-parser helpers used by both the getComponentMeta() scanner and
 * the <Snippet> scanner. oxc returns an ESTree-compatible AST (typed via
 * `@oxc-project/types`, re-exported from `oxc-parser`) with `start` / `end`
 * character offsets on every node, which is what makes 1:1 source slicing
 * possible.
 */

import type { ModuleExportName, Node, Program } from "oxc-parser";

export type { Node, Program };

/** Parse a TypeScript/JSX file into an oxc (ESTree-compatible) program node. */
export async function parseProgram(
	filename: string,
	content: string,
): Promise<Program> {
	const oxc = await import("oxc-parser");
	return oxc.parseSync(filename, content).program;
}

/**
 * Depth-first AST walk. Visits every node (an object carrying a string `type`)
 * in the tree; primitives are skipped and arrays are descended into. Cheap
 * enough for source files — no cycle handling needed since oxc returns a tree,
 * not a graph.
 */
export function walk(root: Node, visit: (node: Node) => void): void {
	const stack: unknown[] = [root];
	while (stack.length > 0) {
		const current = stack.pop();
		if (current === null || typeof current !== "object") continue;

		if (Array.isArray(current)) {
			for (let i = current.length - 1; i >= 0; i--) stack.push(current[i]);
			continue;
		}

		const node = current as Record<string, unknown>;
		if (typeof node.type === "string") visit(node as unknown as Node);

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

/** The string name of a module export name node (`{ foo }` or `{ "foo" }`). */
export function moduleExportName(name: ModuleExportName): string {
	return name.type === "Identifier" ? name.name : name.value;
}
