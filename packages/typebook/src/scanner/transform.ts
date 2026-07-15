import { LOG_PREFIX } from "../constants";
import type { Program } from "./ast";
import { scanMetaCalls } from "./meta-scanner";
import type { TypeScriptClient } from "./ts-client";

/** A pending text insertion at a character offset in the source. */
export interface Edit {
	at: number;
	insert: string;
}

/**
 * Extract props for every `getComponentMeta(Component, config?)` call in an already-parsed module
 * and return the edits that inject a `__props: PropInfo[]` literal into each call's config (or as a
 * new config argument when none was passed). The module is parsed once by the caller and shared —
 * this never parses. Props come from the TypeScript client; without it (plain `tsc`/tests) each
 * injection is an empty array, so the handle still type-checks.
 */
export async function injectMetaProps(
	program: Program,
	filePath: string,
	code: string,
	tsClient: TypeScriptClient | null,
): Promise<Edit[]> {
	const edits: Edit[] = [];
	for (const call of scanMetaCalls(program)) {
		if (call.inject.kind === "unsupported") {
			console.warn(
				LOG_PREFIX,
				`getComponentMeta() in ${filePath} has a non-literal config; props not injected.`,
			);
			continue;
		}
		const props =
			(tsClient && (await tsClient.getProps(filePath, call.callStart, code))) ||
			[];
		const literal = JSON.stringify(props);
		edits.push(
			call.inject.kind === "object"
				? { at: call.inject.at, insert: ` __props: ${literal},` }
				: { at: call.inject.at, insert: `, { __props: ${literal} }` },
		);
	}
	return edits;
}

/** Apply insertions back-to-front so each edit's offset is unaffected by earlier ones. */
export function applyEdits(code: string, edits: Edit[]): string {
	let out = code;
	for (const edit of [...edits].sort((a, b) => b.at - a.at)) {
		out = out.slice(0, edit.at) + edit.insert + out.slice(edit.at);
	}
	return out;
}
