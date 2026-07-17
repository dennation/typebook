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
 * {@link ComponentInfo}s (a single by-type export scan), and runs each `generate` sub-plugin with
 * the full set. In dev it emits at `buildStart` and re-emits on each change; in build it emits at
 * `writeBundle` — after the bundler has emptied `outDir`, so cards written there aren't wiped.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (
	config = {},
) => {
	let cwd = process.cwd();
	let command: TypebookCommand = "build";
	let outDir: string | undefined;
	let client: TypeScriptClient | null = null;
	let starting: Promise<void> | null = null;

	const plugins = config.plugins ?? [];

	const ensureClient = async (): Promise<TypeScriptClient | null> => {
		if (!client && !starting) {
			const candidate = new TypeScriptClient(cwd);
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
		const ctx: GenerateCtx = {
			command,
			root: cwd,
			outDir,
			writeFile: writeFileAt,
		};
		for (const plugin of plugins) {
			if (plugin.apply && plugin.apply !== command) continue;
			try {
				await plugin.generate(docs, ctx);
			} catch (err) {
				// In build, `failOnError` turns a broken generation into a hard failure so CI
				// notices; in dev we always warn and keep the server running.
				if (config.failOnError && command === "build") throw err;
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

	const stopClient = (): void => {
		client?.stop();
		client = null;
		starting = null;
	};

	// One emit per build. `writeBundle` fires once per output; re-armed by `buildStart`.
	let emitted = false;

	return {
		name: PACKAGE_NAME,
		enforce: "pre",

		async buildStart() {
			emitted = false;
			// Dev: emit now, the watcher re-emits on change. Build: defer to `writeBundle` —
			// emitting here lands before the bundler empties `outDir`, wiping cards written into it.
			if (command === "dev") await runGenerate();
		},

		buildEnd() {
			// Dev only: in build the client is still needed by `writeBundle` (which runs after
			// `buildEnd`), so its teardown moves there.
			if (command === "dev") stopClient();
		},

		// Build output phase — runs after `outDir` is emptied and the bundle written, so cards
		// emitted into `outDir` survive. Not reached by a Vite dev server (no bundle).
		async writeBundle() {
			if (command !== "build" || emitted) return;
			emitted = true;
			await runGenerate();
			// ponytail: re-inits the client on the next `vite build --watch` rebuild; fine, that's
			// not a typical consumer path (dev uses the server, CI a one-shot build).
			stopClient();
		},

		vite: {
			configResolved(resolved) {
				cwd = resolved.root;
				command = resolved.command === "serve" ? "dev" : "build";
				outDir = resolved.build?.outDir
					? path.resolve(resolved.root, resolved.build.outDir)
					: undefined;
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
