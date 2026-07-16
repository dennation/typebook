import { globSync } from "node:fs";
import path from "node:path";
import { DEFAULT_HIDDEN_GROUPS, visibleProps } from "../propPolicy";
import { collectComponentInfos, type TypeScriptClient } from "../scanner";
import type { ComponentInfo, TypebookConfig } from "../types";

/**
 * The components to document — from the `components` globs — each trimmed to its visible props by
 * the group policy (`hideGroups`, defaulting to {@link DEFAULT_HIDDEN_GROUPS}).
 */
export async function collectDocs(
	client: TypeScriptClient,
	cwd: string,
	config: TypebookConfig,
): Promise<ComponentInfo[]> {
	const docs = await collectComponentInfos(client, componentFiles(cwd, config));
	const hiddenGroups = config.hideGroups ?? DEFAULT_HIDDEN_GROUPS;
	return docs.map((doc) => ({
		...doc,
		props: visibleProps(doc.props, { hiddenGroups }),
	}));
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
