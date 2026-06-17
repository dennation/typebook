import type { CallExpression, ImportDeclaration } from "oxc-parser";
import { NPM_PACKAGE_NAME } from "../constants.js";
import { moduleExportName, type Program, walk } from "./ast.js";

/**
 * Where to inject the generated `__props` into a `registerComponent(...)` call:
 * - `object`  — config is an object literal; insert right after its `{`.
 * - `newArg`  — only the component was passed; insert `, { __props: … }` after it.
 * - `unsupported` — a config was passed but isn't an object literal (e.g. a variable);
 *   props can't be injected, so the handle keeps its empty `props` (with a build warning).
 */
export type InjectTarget =
	| { kind: "object"; at: number }
	| { kind: "newArg"; at: number }
	| { kind: "unsupported" };

/** A single `registerComponent(Component, config?)` call found in a file. */
export interface RegisterCall {
	/** Character offset of the CallExpression start — used by ts-client to find this exact call. */
	callStart: number;
	/** Where the generated `__props` literal should be injected. */
	inject: InjectTarget;
}

const REGISTER_FN_NAME = "registerComponent";

/**
 * Quick string check before parsing — most files won't contain registerComponent() at all.
 */
export function mayContainRegistration(content: string): boolean {
	return content.includes(`${REGISTER_FN_NAME}(`);
}

/**
 * Extract every `registerComponent(Component, config?)` call (imported from
 * `@dennation/typebook`) from an already-parsed program, along with the position at
 * which the build-time plugin should inject the extracted `__props`. Only the call
 * identity matters — the component reference and any config are resolved later by the
 * TypeScript client; the component no longer needs to be an imported identifier.
 */
export function scanRegistrations(program: Program): RegisterCall[] {
	const registerLocalNames = new Set<string>();

	for (const node of program.body) {
		if (node.type !== "ImportDeclaration") continue;
		if (node.source.value !== NPM_PACKAGE_NAME) continue;
		collectRegisterNames(node, registerLocalNames);
	}

	if (registerLocalNames.size === 0) return [];

	const registers: RegisterCall[] = [];
	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const inject = matchRegisterCall(node, registerLocalNames);
		if (inject === null) return;
		registers.push({ callStart: node.start, inject });
	});

	return registers;
}

/**
 * Collect local names that refer to `registerComponent` from `@dennation/typebook`.
 * Handles aliasing: `import { registerComponent as reg } from '@dennation/typebook'`
 * adds 'reg' to the set.
 */
function collectRegisterNames(decl: ImportDeclaration, out: Set<string>): void {
	for (const spec of decl.specifiers) {
		if (spec.type !== "ImportSpecifier") continue;
		if (moduleExportName(spec.imported) === REGISTER_FN_NAME) {
			out.add(spec.local.name);
		}
	}
}

/**
 * If `node` is a `registerComponent(Component, config?)` call, return where to inject
 * `__props`; otherwise null. The call must have at least the component argument.
 */
function matchRegisterCall(
	node: CallExpression,
	registerLocalNames: Set<string>,
): InjectTarget | null {
	if (node.callee.type !== "Identifier") return null;
	if (!registerLocalNames.has(node.callee.name)) return null;

	const component = node.arguments[0];
	if (!component) return null;

	const config = node.arguments[1];
	if (!config) {
		// `registerComponent(Component)` → add a config object after the component arg.
		return { kind: "newArg", at: component.end };
	}
	if (config.type === "ObjectExpression") {
		// `registerComponent(Component, { … })` → insert just inside the `{`.
		return { kind: "object", at: config.start + 1 };
	}
	return { kind: "unsupported" };
}
