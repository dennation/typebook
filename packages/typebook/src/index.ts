// Base entry — the library's foundation: the React-free **scanner core** (component
// extraction: `collectComponentDocs`, `componentToMarkdown`, `TypeScriptClient`,
// `scanMetaCalls`, `parseProgram`, `injectMetaProps`, …) plus all shared React-free types.
// The React runtime + authoring API (`defineStories`) live in `@dennation/typebook/react`;
// bundler plugins in `@dennation/typebook/{vite,rollup,…}`. Type-only imports (e.g.
// `TypebookConfig` for a bundler config) stay weightless; importing scanner runtime pulls
// in `typescript` + `oxc-parser`.
export * from "./scanner";
export type {
	AllOfConfig,
	GenerateConfig,
	GenerateCtx,
	MissingProps,
	TransformCtx,
	TypebookCommand,
	TypebookConfig,
	TypebookPlugin,
	ValuesConfig,
	VariantConfig,
} from "./types";
