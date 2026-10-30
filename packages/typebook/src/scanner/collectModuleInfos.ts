import path from "node:path";
import type { ComponentInfo, ModuleInfo } from "../types";
import { moduleBindings } from "./moduleBindings";
import { readModuleDoc } from "./readModuleDoc";

/**
 * Group scanned components by the file that surfaced them — one {@link ModuleInfo} per file, in scan
 * order, components in export order — and read each file's `@module` block.
 */
export async function collectModuleInfos(
	components: ComponentInfo[],
): Promise<ModuleInfo[]> {
	const bySource = new Map<string, ComponentInfo[]>();
	for (const component of components) {
		const group = bySource.get(component.sourceFile);
		if (group) group.push(component);
		else bySource.set(component.sourceFile, [component]);
	}

	return Promise.all(
		[...bySource].map(async ([sourceFile, members]) => ({
			name: path.basename(members[0].dir),
			dir: members[0].dir,
			sourceFile,
			components: members,
			bindings: moduleBindings(members),
			...(await readModuleDoc(sourceFile)),
		})),
	);
}
