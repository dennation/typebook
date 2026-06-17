import { LOG_PREFIX } from "../constants";
import { parseProgram } from "./ast";
import { mayContainMetaCall, scanMetaCalls } from "./meta-scanner";
import { mayContainSnippet, scanSnippets } from "./snippet-scanner";
import type { TypeScriptClient } from "./ts-client";

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

/** A pending text insertion at a character offset in the source. */
interface Edit {
	at: number;
	insert: string;
}

/**
 * Inject build-time metadata into a single source module, in place of emitting a
 * generated file. Mirrors fumadocs' `transformStoryFile`: the module is parsed once,
 * both collectors run on the one AST, and the results are spliced back into the
 * source text:
 * - each `getComponentMeta(Component, config?)` call gets a `__props: PropInfo[]`
 *   literal (extracted via the TypeScript client) injected into its config object;
 * - each `<Snippet>{fn}</Snippet>` element gets the sliced source of `fn`'s body
 *   injected as a `__snippetSource` prop.
 *
 * Returns the rewritten source, or `undefined` when the file contains neither (so the
 * bundler skips it untouched). Edits are applied back-to-front so earlier offsets stay
 * valid; no source map is produced (the inserts are data, not user code) — matching the
 * pure-text approach fumadocs takes.
 */
export async function transformTypebook(
	code: string,
	filePath: string,
	tsClient: TypeScriptClient | null,
): Promise<string | undefined> {
	const hasRegistration = mayContainMetaCall(code);
	const hasSnippet = mayContainSnippet(code);
	if (!hasRegistration && !hasSnippet) return undefined;

	const program = await parseProgram(filePath, code);
	const edits: Edit[] = [];

	if (hasRegistration) {
		for (const call of scanMetaCalls(program)) {
			if (call.inject.kind === "unsupported") {
				console.warn(
					LOG_PREFIX,
					`getComponentMeta() in ${filePath} has a non-literal config; props not injected.`,
				);
				continue;
			}
			const props =
				(tsClient &&
					(await tsClient.getProps(filePath, call.callStart, code))) ||
				[];
			const literal = JSON.stringify(props);
			edits.push(
				call.inject.kind === "object"
					? { at: call.inject.at, insert: ` __props: ${literal},` }
					: { at: call.inject.at, insert: `, { __props: ${literal} }` },
			);
		}
	}

	if (hasSnippet) {
		for (const block of scanSnippets(program, code)) {
			if (block.code === null) {
				throw new SnippetNotInlineError(block.name, filePath);
			}
			edits.push({
				at: block.injectAt,
				insert: ` __snippetSource={${JSON.stringify(block.code)}}`,
			});
		}
	}

	if (edits.length === 0) return undefined;
	return applyEdits(code, edits);
}

/** Apply insertions back-to-front so each edit's offset is unaffected by earlier ones. */
function applyEdits(code: string, edits: Edit[]): string {
	let out = code;
	for (const edit of [...edits].sort((a, b) => b.at - a.at)) {
		out = out.slice(0, edit.at) + edit.insert + out.slice(edit.at);
	}
	return out;
}
