// The scanner — the library's **extraction core**, re-exported from the base entry
// `@dennation/typebook` (it's the foundation, not a side entry). Everything that turns source
// text into structured component metadata, with **no React and no bundler** dependency: parses a
// module once (oxc), locates `defineStories()` calls and `<Snippet>` elements, and pulls prop
// types / defaults / JSDoc via the TypeScript Compiler API.
//
// Two levels of API:
//   - orchestration (`collectComponentDocs`, `injectMetaProps`, `TypeScriptClient`) — what the
//     bundler plugins consume to scan a project and scan-and-inject a module;
//   - low-level primitives (`scanMetaCalls`, `scanSnippets`, `parseProgram`, …) — building blocks
//     for a different consumer (a codegen CLI, an AI-instructions adapter).
//
// Pulls in `typescript` + `oxc-parser` only — never the React runtime or docs kit.

// ── React-free metadata types the scanner produces ──────────────────────────
export type { ComponentDoc, PropInfo, PropType } from "../types";
export { type Node, type Program, parseProgram, walk } from "./ast";
// ── Component-doc extraction + rendering (for docs / AI-instruction consumers) ─
export { collectComponentDocs } from "./collectComponentDocs";
export { componentToMarkdown } from "./componentToMarkdown";
export { formatPropType } from "./formatPropType";
// ── Scanning primitives (oxc AST) ───────────────────────────────────────────
export {
	type InjectTarget,
	type MetaCall,
	mayContainMetaCall,
	scanMetaCalls,
} from "./meta-scanner";
export {
	mayContainSnippet,
	type SnippetBlock,
	type SourceRef,
	scanSnippets,
} from "./snippet-scanner";
// ── Source-slicing helper (shared by both slicers) ──────────────────────────
export { dedent } from "./source-slice";
// ── Module-injection primitives (the factory orchestrates these + transform plugins) ─
export { applyEdits, type Edit, injectMetaProps } from "./transform";
export { type SnippetSource, TypeScriptClient } from "./ts-client";
