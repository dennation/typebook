import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PACKAGE_NAME } from "../constants";
import type { TypebookConfig } from "../types";

/** Config filenames tried in `cwd`, in order. */
const CANDIDATES = [".ts", ".mts", ".mjs", ".js"].map(
	(ext) => `${PACKAGE_NAME}.config${ext}`,
);

export interface LoadedConfig {
	config: TypebookConfig;
	/** The config file's directory — the project root every relative path resolves against. */
	root: string;
	configFile: string;
}

/**
 * Load `typebook.config.{ts,mts,mjs,js}`. The config file is the **single** source of truth: the CLI
 * and the bundler plugin both read it, so a task runner can treat it as an input and the two can't
 * drift apart.
 *
 * `.ts` is imported natively — Node strips types on its own since 22.18, so no loader dependency.
 */
export async function loadConfig(
	cwd: string = process.cwd(),
	file?: string,
): Promise<LoadedConfig> {
	const configFile = file ? path.resolve(cwd, file) : findConfig(cwd);
	const module = await importConfig(configFile);
	const config: TypebookConfig | undefined = module.default;
	if (!config) throw new Error(`${configFile} has no default export`);
	return { config, root: path.dirname(configFile), configFile };
}

function findConfig(cwd: string): string {
	for (const name of CANDIDATES) {
		const candidate = path.join(cwd, name);
		if (existsSync(candidate)) return candidate;
	}
	throw new Error(
		`no config found in ${cwd} — expected one of: ${CANDIDATES.join(", ")}`,
	);
}

async function importConfig(
	configFile: string,
): Promise<{ default?: TypebookConfig }> {
	try {
		return await import(pathToFileURL(configFile).href);
	} catch (err) {
		// A `.ts` config relies on Node's own type stripping; say so rather than surfacing a raw
		// "unknown file extension" from the loader.
		const hint = configFile.endsWith(".ts")
			? "\n(a TypeScript config needs Node 22.18+; on older versions rename it to .mjs)"
			: "";
		throw new Error(
			`failed to load ${configFile}: ${(err as Error).message}${hint}`,
		);
	}
}
