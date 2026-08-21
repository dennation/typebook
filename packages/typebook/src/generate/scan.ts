import { collectComponentInfos, TypeScriptClient } from "../scanner";
import type { ComponentInfo } from "../types";
import { resolveComponentFiles } from "./resolveComponentFiles";

export interface ScanOptions {
	/** Project root — the directory holding the config. Globs resolve against it. */
	root: string;
	/** Files to scan — a path, list, or globs; `!` excludes. */
	components?: string | string[];
	/**
	 * A started {@link TypeScriptClient} to scan with. Pass a warm one to reuse its program across
	 * runs (a dev server does); omit and one is started and stopped for this call.
	 */
	client?: TypeScriptClient;
}

/**
 * Extract every exported React component in `components` — the one thing the core does.
 *
 * What anyone makes of the result is not its business: plugins take these {@link ComponentInfo}s and
 * produce whatever they produce.
 */
export async function scan(options: ScanOptions): Promise<ComponentInfo[]> {
	const { root, components, client } = options;
	const sources = resolveComponentFiles(root, components);
	if (sources.length === 0) return [];

	const own = client ? null : new TypeScriptClient(root);
	if (own) await own.start();
	try {
		return await collectComponentInfos(
			client ?? (own as TypeScriptClient),
			sources,
		);
	} finally {
		own?.stop();
	}
}

/**
 * `scan`, deferred until someone asks and then shared. Internal to {@link runCommands}: deferring is
 * what makes a command that needs no components free, and sharing is what keeps a run with several
 * commands down to a single TypeScript program.
 */
export function lazyScan(options: ScanOptions): () => Promise<ComponentInfo[]> {
	let pending: Promise<ComponentInfo[]> | null = null;
	return () => {
		pending ??= scan(options);
		return pending;
	};
}
