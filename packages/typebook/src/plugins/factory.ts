import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { LOG_PREFIX, PACKAGE_NAME } from "../constants";
import { TypeScriptClient } from "../scanner";
import type { GenerateCtx, TypebookCommand, TypebookConfig } from "../types";
import { collectDocs } from "./collectDocs";

/**
 * Shared unplugin factory — no bundler is privileged. Works across every bundler
 * unplugin supports (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm).
 *
 * It owns one warm {@link TypeScriptClient}, scans the `components` config into
 * {@link ComponentInfo}s (a single by-type export scan), and runs each `generate` sub-plugin
 * with the full set — once at `buildStart` (dev + build) and again on each change in dev.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (
	config = {},
) => {
	let cwd = process.cwd();
	let command: TypebookCommand = "build";
	let client: TypeScriptClient | null = null;
	let starting: Promise<void> | null = null;

	const plugins = config.plugins ?? [];

	const ensureClient = async (): Promise<TypeScriptClient | null> => {
		if (!client && !starting) {
			const candidate = new TypeScriptClient(cwd, config.inheritedProviders);
			starting = candidate
				.start()
				.then(() => {
					client = candidate;
				})
				.catch((err: Error) => {
					console.warn(
						LOG_PREFIX,
						"TypeScript client unavailable; components won't be scanned",
					);
					console.warn(LOG_PREFIX, err.message);
				});
		}
		if (starting) await starting;
		return client;
	};

	/** Write a file at an absolute or root-relative path, creating parent dirs. */
	const writeFileAt = async (
		target: string,
		content: string,
	): Promise<void> => {
		const abs = path.isAbsolute(target) ? target : path.join(cwd, target);
		await mkdir(path.dirname(abs), { recursive: true });
		await writeFile(abs, content, "utf8");
	};

	/** Scan the configured components and run every sub-plugin with the full set. */
	const runGenerate = async (): Promise<void> => {
		if (plugins.length === 0) return;
		const c = await ensureClient();
		if (!c) return;

		const docs = await collectDocs(c, cwd, config);
		const ctx: GenerateCtx = { command, root: cwd, writeFile: writeFileAt };
		for (const plugin of plugins) {
			if (plugin.apply && plugin.apply !== command) continue;
			try {
				await plugin.generate(docs, ctx);
			} catch (err) {
				console.warn(
					LOG_PREFIX,
					`plugin "${plugin.name}" failed:`,
					(err as Error).message,
				);
			}
		}
	};

	let regenTimer: ReturnType<typeof setTimeout> | null = null;
	const scheduleRegen = (): void => {
		if (regenTimer) clearTimeout(regenTimer);
		regenTimer = setTimeout(() => void runGenerate(), 150);
	};

	return {
		name: PACKAGE_NAME,
		enforce: "pre",

		async buildStart() {
			await runGenerate();
		},

		buildEnd() {
			client?.stop();
			client = null;
			starting = null;
		},

		vite: {
			configResolved(resolved) {
				cwd = resolved.root;
				command = resolved.command === "serve" ? "dev" : "build";
			},

			configureServer(server) {
				const onChange = (changed: string): void => {
					void ensureClient().then((c) => {
						c?.notifyChange([changed]);
						scheduleRegen();
					});
				};
				server.watcher.on("change", onChange);
				server.watcher.on("add", onChange);
				server.watcher.on("unlink", onChange);
			},
		},
	};
};

export const unplugin = createUnplugin(unpluginFactory);

export default unplugin;
