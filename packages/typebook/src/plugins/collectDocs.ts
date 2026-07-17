import { globSync } from "tinyglobby";
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

/** The `components` config (path / list / globs) resolved to an absolute, de-duplicated file list. */
function componentFiles(cwd: string, config: TypebookConfig): string[] {
	if (config.components == null) return [];
	const patterns = Array.isArray(config.components)
		? config.components
		: [config.components];
	return globSync(patterns, { cwd, absolute: true });
}
