import { existsSync, globSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { LOG_PREFIX, PACKAGE_NAME } from "../constants";
import { collectComponentInfos, TypeScriptClient } from "../scanner";
import type { GenerateCtx, TypebookCommand, TypebookConfig } from "../types";

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

	/** Resolve the `components` config (path / list / globs) to an absolute file list. */
	const resolveComponentFiles = (): string[] => {
		const patterns =
			config.components == null
				? []
				: Array.isArray(config.components)
					? config.components
					: [config.components];
		const files = new Set<string>();
		for (const pattern of patterns) {
			for (const match of globSync(pattern, { cwd })) {
				files.add(path.resolve(cwd, match.toString()));
			}
		}
		return [...files];
	};

	const CONFIG_EXTS = ["ts", "mts", "cts", "tsx", "js", "mjs", "cjs"];
	/** The `typebook.config.*` path — the explicit override, else auto-discovered at the root. */
	const resolveConfigFile = (): string | null => {
		if (config.configFile) {
			const abs = path.resolve(cwd, config.configFile);
			return existsSync(abs) ? abs : null;
		}
		for (const ext of CONFIG_EXTS) {
			const abs = path.join(cwd, `typebook.config.${ext}`);
			if (existsSync(abs)) return abs;
		}
		return null;
	};

	/**
	 * The components to scan: from `typebook.config.ts` (imported references) when present, else the
	 * `components` globs. The config lists specific exports, so a file's other exports are dropped.
	 */
	const collectDocs = async (c: TypeScriptClient) => {
		const configFile = resolveConfigFile();
		if (!configFile) return collectComponentInfos(c, resolveComponentFiles());

		const wanted = await c.resolveConfigComponents(configFile);
		const files = [...new Set(wanted.map((w) => w.file))];
		const wantedKeys = new Set(wanted.map((w) => `${w.file}#${w.name}`));
		const all = await collectComponentInfos(c, files);
		return all.filter((d) => wantedKeys.has(`${d.file}#${d.name}`));
	};

	/** Scan configured files and run every sub-plugin with the full component set. */
	const runGenerate = async (): Promise<void> => {
		if (plugins.length === 0) return;
		const c = await ensureClient();
		if (!c) return;

		const docs = await collectDocs(c);
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
