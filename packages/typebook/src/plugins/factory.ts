import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import { LOG_PREFIX, PACKAGE_NAME } from "../constants";
import { transformTypebook } from "../core/transform";
import { TypeScriptClient } from "../core/ts-client";
import type { TypebookConfig } from "../types";

/** Source files the plugin will consider rewriting (registrations + snippets live in TS/JS). */
const TRANSFORM_ID = /\.(tsx|ts|jsx|js|mts|cts|mjs|cjs)(\?.*)?$/;

/**
 * Shared unplugin factory — no bundler is privileged. Works across every bundler
 * unplugin supports (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm).
 *
 * Instead of generating files, the plugin rewrites each source module in its
 * `transform` hook (see {@link transformTypebook}):
 * - `getComponentMeta(Component, …)` calls get a `__props` literal injected;
 * - `<Snippet>{fn}</Snippet>` elements get a `__snippetSource` prop injected.
 *
 * A single warm {@link TypeScriptClient} (lazily started on the first transform)
 * extracts prop metadata. In Vite's dev server the file watcher notifies the client
 * of changes so the warm program stays fresh; re-transformation (and thus prop
 * re-extraction) then happens through Vite's own module invalidation.
 */
export const unpluginFactory: UnpluginFactory<TypebookConfig | undefined> = (
	config = {},
) => {
	let cwd = process.cwd();
	let client: TypeScriptClient | null = null;
	let starting: Promise<void> | null = null;

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

	return {
		name: PACKAGE_NAME,
		enforce: "pre",

		transformInclude(id) {
			return !id.includes("/node_modules/") && TRANSFORM_ID.test(id);
		},

		async transform(code, id) {
			const filePath = id.split("?")[0];
			const tsClient = await ensureClient();
			const out = await transformTypebook(code, filePath, tsClient);
			if (out === undefined) return undefined;
			// A `<Snippet source={ref}>` resolved into another module: tell the bundler this
			// module's output depends on that file, so editing it re-runs this transform.
			for (const file of out.watchFiles) this.addWatchFile(file);
			return { code: out.code, map: null };
		},

		buildEnd() {
			client?.stop();
			client = null;
			starting = null;
		},

		vite: {
			configResolved(resolved) {
				cwd = resolved.root;
			},

			configureServer(server) {
				const notify = (path: string): void => {
					void ensureClient().then((c) => c?.notifyChange([path]));
				};
				server.watcher.on("change", notify);
				server.watcher.on("add", notify);
				server.watcher.on("unlink", notify);
			},
		},
	};
};

export const unplugin = createUnplugin(unpluginFactory);

export default unplugin;
