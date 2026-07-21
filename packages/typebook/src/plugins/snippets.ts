import { LOG_PREFIX } from "../constants";
import { mayContainSnippet, scanSnippets } from "../scanner";
import type { TypebookPlugin } from "../types";

/** Thrown when a `<Snippet>` child isn't an inline function component (can't be sliced). */
export class SnippetNotInlineError extends Error {
	constructor(name: string | null, file: string) {
		super(
			[
				"<Snippet> children must be an inline function component.",
				`  - snippet ${name ? `"${name}"` : "(unnamed)"}`,
				`      ${file}`,
				"  Write the example inline: {() => <Component/>} (or {function Demo() { … }} for hooks).",
			].join("\n"),
		);
		this.name = "SnippetNotInlineError";
	}
}

/**
 * `typebook()` transform sub-plugin: for each `<Snippet>{fn}</Snippet>` in a module, inject the
 * sliced source of the example as a `__snippetSource` prop so the runtime can show it (no context,
 * no generated file). An inline child is sliced 1:1 from the module; a `source={ref}` reference is
 * resolved across modules through the TypeScript client and that file registered as a watch dep.
 *
 * Opt-in — add `snippets()` to `typebook({ plugins: [...] })` to enable `<Snippet>` handling.
 */
export function snippets(): TypebookPlugin {
	return {
		name: "snippets",
		mayTransform: mayContainSnippet,
		async transform(ctx) {
			for (const block of scanSnippets(ctx.program, ctx.code)) {
				let source: string;
				if (block.sourceRef) {
					// `source={ref}` — resolve the function across modules and slice it.
					const resolved =
						ctx.tsClient &&
						(await ctx.tsClient.getSnippetSource(
							ctx.filePath,
							block.sourceRef.offset,
							ctx.code,
						));
					if (!resolved) {
						console.warn(
							LOG_PREFIX,
							`<Snippet source={${block.sourceRef.name}}> in ${ctx.filePath}: could not resolve a function to slice; source not injected.`,
						);
						continue;
					}
					source = resolved.source;
					ctx.addWatchFile(resolved.file);
				} else {
					if (block.code === null) {
						throw new SnippetNotInlineError(block.name, ctx.filePath);
					}
					source = block.code;
				}
				ctx.inject(
					block.injectAt,
					` __snippetSource={${JSON.stringify(source)}}`,
				);
			}
		},
	};
}
