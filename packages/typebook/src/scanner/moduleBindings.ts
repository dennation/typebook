import type { ComponentInfo } from "../types";

/** What importing these components takes: each one's `parent ?? name`, in order, without repeats. */
export function moduleBindings(components: ComponentInfo[]): string[] {
	return [...new Set(components.map((c) => c.parent ?? c.name))];
}
