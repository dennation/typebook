import type { CallExpression, ImportDeclaration } from "oxc-parser";
import { NPM_REACT_PACKAGE_NAME } from "../constants";
import { moduleExportName, type Program, walk } from "./ast";

/**
 * Where to inject the generated `__props` into a `getComponentMeta(...)` call:
 * - `object`  — config is an object literal; insert right after its `{`.
 * - `newArg`  — only the component was passed; insert `, { __props: … }` after it.
 * - `unsupported` — a config was passed but isn't an object literal (e.g. a variable);
 *   props can't be injected, so the handle keeps its empty `props` (with a build warning).
 */
export type InjectTarget =
	| { kind: "object"; at: number }
	| { kind: "newArg"; at: number }
	| { kind: "unsupported" };

/** A single `getComponentMeta(Component, config?)` call found in a file. */
export interface MetaCall {
	/** Character offset of the CallExpression start — used by ts-client to find this exact call. */
	callStart: number;
	/** Where the generated `__props` literal should be injected. */
	inject: InjectTarget;
}

const META_FN_NAME = "getComponentMeta";

/**
 * Quick string check before parsing — most files won't contain getComponentMeta() at all.
 */
export function mayContainMetaCall(content: string): boolean {
	return content.includes(`${META_FN_NAME}(`);
}

/**
 * Extract every `getComponentMeta(Component, config?)` call (imported from
 * `@dennation/typebook/react`) from an already-parsed program, along with the position at
 * which the build-time plugin should inject the extracted `__props`. Only the call
 * identity matters — the component reference and any config are resolved later by the
 * TypeScript client; the component no longer needs to be an imported identifier.
 */
export function scanMetaCalls(program: Program): MetaCall[] {
	const metaLocalNames = new Set<string>();

	for (const node of program.body) {
		if (node.type !== "ImportDeclaration") continue;
		if (node.source.value !== NPM_REACT_PACKAGE_NAME) continue;
		collectMetaNames(node, metaLocalNames);
	}

	if (metaLocalNames.size === 0) return [];

	const calls: MetaCall[] = [];
	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const inject = matchMetaCall(node, metaLocalNames);
		if (inject === null) return;
		calls.push({ callStart: node.start, inject });
	});

	return calls;
}

/**
 * Collect local names that refer to `getComponentMeta` from `@dennation/typebook`.
 * Handles aliasing: `import { getComponentMeta as reg } from '@dennation/typebook'`
 * adds 'reg' to the set.
 */
function collectMetaNames(decl: ImportDeclaration, out: Set<string>): void {
	for (const spec of decl.specifiers) {
		if (spec.type !== "ImportSpecifier") continue;
		if (moduleExportName(spec.imported) === META_FN_NAME) {
			out.add(spec.local.name);
		}
	}
}

/**
 * If `node` is a `getComponentMeta(Component, config?)` call, return where to inject
 * `__props`; otherwise null. The call must have at least the component argument.
 */
function matchMetaCall(
	node: CallExpression,
	metaLocalNames: Set<string>,
): InjectTarget | null {
	if (node.callee.type !== "Identifier") return null;
	if (!metaLocalNames.has(node.callee.name)) return null;

	const component = node.arguments[0];
	if (!component) return null;

	const config = node.arguments[1];
	if (!config) {
		// `getComponentMeta(Component)` → add a config object after the component arg.
		return { kind: "newArg", at: component.end };
	}
	if (config.type === "ObjectExpression") {
		// `getComponentMeta(Component, { … })` → insert just inside the `{`.
		return { kind: "object", at: config.start + 1 };
	}
	return { kind: "unsupported" };
}
