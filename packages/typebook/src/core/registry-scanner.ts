import type { Argument, CallExpression, ImportDeclaration } from "oxc-parser";
import { NPM_PACKAGE_NAME } from "../constants.js";
import { moduleExportName, type Program, walk } from "./ast.js";

/** Resolved component import: the component argument of `registerComponent(id, Component, ...)` */
export interface ComponentImport {
	/** Original exported name in the source module (e.g. `Button`) */
	name: string;
	/** Module specifier the component was imported from (e.g. `./components/Button`) */
	path: string;
}

/** A single `registerComponent(id, Component, ...)` call found in a file */
export interface RegisterCall {
	/** String literal id (first argument) */
	id: string;
	/** Resolved component import for the second argument */
	componentImport: ComponentImport;
	/** Character offset of the CallExpression in source — used by ts-client to find this exact call */
	callStart: number;
}

const REGISTER_FN_NAME = "registerComponent";

/**
 * Quick string check before parsing — most files won't contain registerComponent() at all.
 */
export function mayContainRegistration(content: string): boolean {
	return content.includes(`${REGISTER_FN_NAME}(`);
}

/**
 * Extract every `registerComponent(id, Component, ...)` call (imported from
 * `@dennation/typebook`) from an already-parsed program. Imports are resolved so each
 * call carries the originating module path for its component argument.
 *
 * Only calls whose first argument is a string literal AND whose second argument is an
 * imported Identifier are kept — locally-declared components can't be referenced from
 * the generated registry.
 */
export function scanRegistrations(program: Program): RegisterCall[] {
	const componentImports = new Map<string, ComponentImport>();
	const registerLocalNames = new Set<string>();

	for (const node of program.body) {
		if (node.type !== "ImportDeclaration") continue;
		if (node.source.value === NPM_PACKAGE_NAME) {
			collectRegisterNames(node, registerLocalNames);
		} else {
			collectComponentImports(node, node.source.value, componentImports);
		}
	}

	const registers: RegisterCall[] = [];
	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const match = matchRegisterCall(node, registerLocalNames);
		if (match === null) return;

		const componentImport = componentImports.get(match.componentLocal);
		if (!componentImport) return;

		registers.push({
			id: match.id,
			componentImport,
			callStart: node.start,
		});
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

function collectComponentImports(
	decl: ImportDeclaration,
	source: string,
	out: Map<string, ComponentImport>,
): void {
	for (const spec of decl.specifiers) {
		if (spec.type === "ImportDefaultSpecifier") {
			out.set(spec.local.name, { name: spec.local.name, path: source });
		} else if (spec.type === "ImportSpecifier") {
			out.set(spec.local.name, {
				name: moduleExportName(spec.imported),
				path: source,
			});
		}
	}
}

function matchRegisterCall(
	node: CallExpression,
	registerLocalNames: Set<string>,
): { id: string; componentLocal: string } | null {
	if (node.callee.type !== "Identifier") return null;
	if (!registerLocalNames.has(node.callee.name)) return null;

	const id = stringLiteralValue(node.arguments[0]);
	if (id === null) return null;

	const componentLocal = identifierName(node.arguments[1]);
	if (componentLocal === null) return null;

	return { id, componentLocal };
}

function stringLiteralValue(arg: Argument | undefined): string | null {
	if (arg?.type === "Literal" && typeof arg.value === "string")
		return arg.value;
	return null;
}

/**
 * Unwrap `TSInstantiationExpression` (e.g. `Select<T>`) down to the underlying
 * Identifier. Returns null for anything else.
 */
function identifierName(arg: Argument | undefined): string | null {
	if (!arg) return null;
	if (arg.type === "Identifier") return arg.name;
	if (arg.type === "TSInstantiationExpression") {
		return identifierName(arg.expression);
	}
	return null;
}
