import { globSync } from "node:fs";
import path from "node:path";
import { collectComponentInfos, type TypeScriptClient } from "../scanner";
import type { ComponentInfo, TypebookConfig } from "../types";

/**
 * The components to document — every exported component in the `components` globs, with its **full**
 * set of props. Which props each artifact surfaces (the group policy) is decided by the consuming
 * plugin, not here.
 */
export async function collectDocs(
	client: TypeScriptClient,
	cwd: string,
	config: TypebookConfig,
): Promise<ComponentInfo[]> {
	return collectComponentInfos(client, componentFiles(cwd, config));
}

/** The `components` config (path / list / globs) resolved to an absolute file list. */
function componentFiles(cwd: string, config: TypebookConfig): string[] {
	const patterns =
		config.components == null
			? []
			: Array.isArray(config.components)
				? config.components
				: [config.components];
	const files = new Set<string>();
	for (const pattern of patterns)
		for (const match of globSync(pattern, { cwd }))
			files.add(path.resolve(cwd, match.toString()));
	return [...files];
}
