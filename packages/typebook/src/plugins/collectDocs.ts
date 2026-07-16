import { existsSync, globSync } from "node:fs";
import path from "node:path";
import type { ComponentSettings } from "../config";
import { DEFAULT_HIDDEN_GROUPS, visibleProps } from "../propPolicy";
import { collectComponentInfos, type TypeScriptClient } from "../scanner";
import type { ComponentInfo, TypebookConfig } from "../types";

const CONFIG_EXTS = ["ts", "mts", "cts", "tsx", "js", "mjs", "cjs"];

/**
 * The components to document, each already trimmed to its visible props (group policy +
 * per-component settings): from `typebook.config.ts` (imported references + settings) when present,
 * else the `components` globs. The config lists specific exports, so a file's other exports drop.
 */
export async function collectDocs(
	client: TypeScriptClient,
	cwd: string,
	config: TypebookConfig,
): Promise<ComponentInfo[]> {
	const configFile = resolveConfigFile(cwd, config);
	if (!configFile) {
		const docs = await collectComponentInfos(
			client,
			componentGlobFiles(cwd, config),
		);
		return docs.map((d) => applyPolicy(d, config));
	}

	const wanted = await client.resolveConfigComponents(configFile);
	const files = [...new Set(wanted.map((w) => w.file))];
	const settingsByKey = new Map(
		wanted.map((w) => [`${w.file}#${w.name}`, w.settings]),
	);
	const all = await collectComponentInfos(client, files);
	return all
		.filter((d) => settingsByKey.has(`${d.file}#${d.name}`))
		.map((d) =>
			applyPolicy(d, config, settingsByKey.get(`${d.file}#${d.name}`)),
		);
}

/** The `components` config (path / list / globs) resolved to an absolute file list. */
function componentGlobFiles(cwd: string, config: TypebookConfig): string[] {
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

/** The `typebook.config.*` path — the explicit override, else auto-discovered at the root. */
function resolveConfigFile(cwd: string, config: TypebookConfig): string | null {
	if (config.configFile) {
		const abs = path.resolve(cwd, config.configFile);
		return existsSync(abs) ? abs : null;
	}
	for (const ext of CONFIG_EXTS) {
		const abs = path.join(cwd, `typebook.config.${ext}`);
		if (existsSync(abs)) return abs;
	}
	return null;
}

/** Trim a component's props to the documented set: global group policy + per-component settings. */
function applyPolicy(
	doc: ComponentInfo,
	config: TypebookConfig,
	settings?: ComponentSettings,
): ComponentInfo {
	const hiddenGroups = [
		...(config.hideGroups ?? DEFAULT_HIDDEN_GROUPS),
		...(settings?.hideGroups ?? []),
	];
	return {
		...doc,
		props: visibleProps(doc.props, {
			hiddenGroups,
			omit: settings?.omit,
			pick: settings?.pick,
		}),
	};
}
