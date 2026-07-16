// Base entry — the library's foundation: the React-free **scanner core** (`collectComponentInfos`,
// `TypeScriptClient`) plus all shared types. It reads the components named
// by the `components` config and extracts each exported component's props, defaults and JSDoc by
// type via the TypeScript Compiler API; sub-plugins (e.g. `llmInstructions`) turn the result into
// artifacts. Bundler plugins live in `@dennation/typebook/{vite,rollup,…}`. Type-only imports
// (e.g. `TypebookConfig` for a bundler config) stay weightless; the runtime pulls in `typescript`.
export * from "./scanner";
export {
	DEFAULT_HIDDEN_GROUPS,
	type PropPolicy,
	visibleProps,
} from "./propPolicy";
export type {
	GenerateCtx,
	TypebookCommand,
	TypebookConfig,
	TypebookPlugin,
} from "./types";
