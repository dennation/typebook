// The scanner — the library's **extraction core**, re-exported from the base entry
// `@dennation/typebook`. It reads the components named by the `components` config and extracts
// each exported React component's props, defaults and JSDoc **by type** via the TypeScript
// Compiler API — no React, no bundler dependency. Sub-plugins (e.g. `aiInstructions`) turn the
// resulting `ComponentDoc[]` into artifacts.
//
// Pulls in `typescript` only; type-only imports stay weightless.

// ── React-free metadata types the scanner produces ──────────────────────────
export type { ComponentDoc, PropInfo, PropType } from "../types";
// ── Component-doc extraction + rendering ─────────────────────────────────────
export { collectComponentDocs } from "./collectComponentDocs";
export { componentToMarkdown } from "./componentToMarkdown";
export { formatPropType } from "./formatPropType";
export { TypeScriptClient } from "./ts-client";
