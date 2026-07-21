// The scanner — the library's **extraction core**, re-exported from the base entry
// `@dennation/typebook`. It reads the components named by the `components` config and extracts
// each exported React component's props, defaults and JSDoc **by type** via the TypeScript
// Compiler API — no React, no bundler dependency. Sub-plugins (e.g. `llmInstructions`) turn the
// resulting `ComponentInfo[]` into artifacts.
//
// Pulls in `typescript` only; type-only imports stay weightless.

// ── React-free metadata types the scanner produces ──────────────────────────
export type { ComponentInfo, PropGroup, PropInfo, PropType } from "../types";
// ── Component extraction ─────────────────────────────────────────────────────
export { applyEdits, type Edit } from "./applyEdits";
export { type Node, type Program, parseProgram, walk } from "./ast";
export { classifyPropGroup } from "./classifyPropGroup";
export { collectComponentInfos } from "./collectComponentInfos";
// ── Snippet scanning primitives (oxc AST + shared source slicing) ────────────
export {
	mayContainSnippet,
	type SnippetBlock,
	type SourceRef,
	scanSnippets,
} from "./snippet-scanner";
export { dedent } from "./source-slice";
export { type SnippetSource, TypeScriptClient } from "./ts-client";
