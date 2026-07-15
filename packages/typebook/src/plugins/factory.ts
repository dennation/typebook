import { globSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { LOG_PREFIX, PACKAGE_NAME } from "../constants";
import {
	applyEdits,
	collectComponentDocs,
	type Edit,
	injectMetaProps,
	mayContainMetaCall,
	parseProgram,
	TypeScriptClient,
} from "../scanner";
import type {
	GenerateCtx,
	TransformCtx,
	TypebookCommand,
	TypebookConfig,
	TypebookPlugin,
} from "../types";

/** Source files the plugin will consider rewriting (registrations + transform plugins live in TS/JS). */
const TRANSFORM_ID = /\.(tsx|ts|jsx|js|mts|cts|mjs|cjs)(\?.*)?$/;

/**
 * Shared unplugin factory — no bundler is privileged. Works across every bundler
 * unplugin supports (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm).
 *
 * The factory owns one warm {@link TypeScriptClient} and orchestrates two things:
 * - **Per-module injection** (`transform` hook): the module is parsed once, then the built-in
 *   props injector ({@link injectMetaProps}) and every `transform` sub-plugin (e.g. `snippets()`)
 *   record edits against that one parse; the collected edits are applied back-to-front.
 * - **Project-wide codegen** (`generate` sub-plugins, e.g. `aiInstructions()`): the whole project
 *   is scanned into {@link ComponentDoc}s and each plugin runs with the full set — at `buildStart`
 *   (dev + build) and again on each relevant change in dev.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (
	config = {},
) => {
	let cwd = process.cwd();
	let command: TypebookCommand = "build";
	let client: TypeScriptClient | null = null;
	let starting: Promise<void> | null = null;

	const plugins = config.plugins ?? [];
	const transformPlugins = plugins.filter(
		(
			p,
		): p is TypebookPlugin & {
			transform: NonNullable<TypebookPlugin["transform"]>;
		} => typeof p.transform === "function",
	);
	const generatePlugins = plugins.filter(
		(
			p,
		): p is TypebookPlugin & {
			generate: NonNullable<TypebookPlugin["generate"]>;
		} => typeof p.generate === "function",
	);

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
						"TypeScript client unavailable; props won't be extracted",
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

	/** Transform sub-plugins active for the current command. */
	const activeTransformPlugins = (): typeof transformPlugins =>
		transformPlugins.filter((p) => !p.apply || p.apply === command);

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

	/** Scan configured files and run every `generate` sub-plugin with the full component set. */
	const runGenerate = async (): Promise<void> => {
		if (generatePlugins.length === 0) return;
		const c = await ensureClient();
		if (!c) return;

		const docs = await collectComponentDocs(c, resolveComponentFiles());
		const ctx: GenerateCtx = { command, root: cwd, writeFile: writeFileAt };
		for (const plugin of generatePlugins) {
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

		transformInclude(id) {
			return !id.includes("/node_modules/") && TRANSFORM_ID.test(id);
		},

		async transform(code, id) {
			const filePath = id.split("?")[0];
			const active = activeTransformPlugins();

			// Cheap string gate before parsing: does the built-in props injector or any
			// transform plugin have something to do here?
			const wantsProps = mayContainMetaCall(code);
			const wantsPlugin = active.some((p) => p.mayTransform?.(code) ?? true);
			if (!wantsProps && !wantsPlugin) return undefined;

			const tsClient = await ensureClient();
			const program = await parseProgram(filePath, code); // one parse, shared below
			const edits: Edit[] = [];
			const watchFiles = new Set<string>();

			if (wantsProps)
				edits.push(
					...(await injectMetaProps(program, filePath, code, tsClient)),
				);

			if (active.length > 0) {
				const ctx: TransformCtx = {
					code,
					filePath,
					program,
					tsClient,
					inject: (at, text) => edits.push({ at, insert: text }),
					addWatchFile: (file) => watchFiles.add(file),
				};
				for (const plugin of active) {
					if (!(plugin.mayTransform?.(code) ?? true)) continue;
					await plugin.transform(ctx);
				}
			}

			if (edits.length === 0) return undefined;
			for (const file of watchFiles) this.addWatchFile(file);
			return { code: applyEdits(code, edits), map: null };
		},

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
