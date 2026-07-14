// Public entry: `@dennation/typebook/scanner`.
//
// The scanner is the **extraction core** — everything that turns source text into
// structured component metadata, with **no React and no bundler** dependency. It parses
// a module once (oxc), locates `getComponentMeta()` calls and `<Snippet>` elements, and
// pulls prop types / defaults / JSDoc via the TypeScript Compiler API.
//
// Two levels of API are exposed:
//   - high-level orchestration (`transformTypebook`, `TypeScriptClient`) — what the bundler
//     plugins consume to scan-and-inject a module;
//   - low-level primitives (`scanMetaCalls`, `scanSnippets`, `parseProgram`, …) — the building
//     blocks a different consumer (a codegen CLI, an AI-instructions adapter) can use to read
//     the same metadata without the injection step.
//
// This entry pulls in `typescript` + `oxc-parser` only — importing it never loads the React
// runtime or the docs kit, so a scan-only consumer stays lean.

// ── High-level orchestration ────────────────────────────────────────────────
export {
	SnippetNotInlineError,
	type TransformResult,
	transformTypebook,
} from "./transform";
export { type SnippetSource, TypeScriptClient } from "./ts-client";

// ── Scanning primitives (oxc AST) ───────────────────────────────────────────
export {
	type InjectTarget,
	type MetaCall,
	mayContainMetaCall,
	scanMetaCalls,
} from "./meta-scanner";
export {
	mayContainSnippet,
	scanSnippets,
	type SnippetBlock,
	type SourceRef,
} from "./snippet-scanner";
export { type Node, parseProgram, type Program, walk } from "./ast";

// ── Source-slicing helper (shared by both slicers) ──────────────────────────
export { dedent } from "./source-slice";

// ── React-free metadata types the scanner produces ──────────────────────────
export type { PropInfo, PropType } from "../types";
