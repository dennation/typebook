import path from "node:path";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { LOG_PREFIX, PACKAGE_NAME } from "../constants";
import { loadConfig, runCommands } from "../generate";
import { TypeScriptClient } from "../scanner";
import type { TypebookConfig } from "../types";

/**
 * Extensions whose contents can change a TypeScript type. A scan reads types, so a stylesheet, a
 * Markdown file or an image can never change its result — rescanning after one is pure cost.
 *
 * Deliberately not narrowed to the `components` globs: a base type edited in a file that is not
 * itself a component still changes the props that get extracted.
 */
const TYPE_BEARING = /\.(?:[cm]?tsx?|json)$/;

export interface TypebookPluginOptions {
	/**
	 * Path to the config file, relative to the project root. Defaults to
	 * `typebook.config.{ts,mts,mjs,js}` there.
	 */
	configFile?: string;
}

/**
 * Shared unplugin factory — no bundler is privileged.
 *
 * It runs the commands the config names in `dev` / `build`, nothing more: which commands exist is
 * the plugins' business, and what they do is theirs too. The factory only supplies a warm
 * TypeScript program and re-runs on watched changes.
 */
export const unpluginFactory: UnpluginFactory<
	TypebookPluginOptions | undefined
> = (options = {}) => {
	let root = process.cwd();
	let trigger: "dev" | "build" = "build";
	let config: TypebookConfig | null = null;
	let client: TypeScriptClient | null = null;
	let starting: Promise<void> | null = null;

	const ensureClient = async (): Promise<TypeScriptClient | null> => {
		if (!client && !starting) {
			const candidate = new TypeScriptClient(root);
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

	const run = async (): Promise<void> => {
		config ??= (await loadConfig(root, options.configFile)).config;
		const names = (trigger === "dev" ? config.dev : config.build) ?? [];
		if (names.length === 0) return;
		await runCommands({
			config,
			root,
			names,
			trigger,
			client: (await ensureClient()) ?? undefined,
		});
	};

	let regenTimer: ReturnType<typeof setTimeout> | null = null;
	const scheduleRun = (): void => {
		if (regenTimer) clearTimeout(regenTimer);
		regenTimer = setTimeout(() => {
			run().catch((err: Error) => {
				// A dev server keeps serving; the command's own output already said what went wrong.
				console.warn(LOG_PREFIX, err.message);
			});
		}, 150);
	};

	return {
		name: PACKAGE_NAME,
		enforce: "pre",

		async buildStart() {
			await run();
		},

		buildEnd() {
			client?.stop();
			client = null;
			starting = null;
		},

		vite: {
			configResolved(resolved) {
				root = resolved.root;
				trigger = resolved.command === "serve" ? "dev" : "build";
			},

			configureServer(server) {
				const onChange = (changed: string): void => {
					if (!TYPE_BEARING.test(changed)) return;
					if (path.resolve(changed).startsWith(path.join(root, ".git"))) return;
					void ensureClient().then((c) => {
						c?.notifyChange([changed]);
						scheduleRun();
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
