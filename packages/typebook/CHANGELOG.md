# @dennation/typebook

## 0.1.0

### Minor Changes

- 2249c3e: Initial release: the component **scanner** and the **AI instructions** plugin.

  - `@dennation/typebook` — the scanner core: point `typebook({ components })` at your components (glob) and it extracts every exported React component's prop types, defaults and JSDoc by type (no wrapper call). Exposes `collectComponentInfos`, `componentToMarkdown`, `TypeScriptClient`, plus the React-free types (`TypebookConfig`, `ComponentInfo`, `TypebookPlugin`, …).
  - `@dennation/typebook/plugins/llm-instructions` — `llmInstructions()` generates one Markdown card per component (props table + description + deprecation) plus an index, as context for AI agents (Claude Code, Codex).
  - `@dennation/typebook/{vite,rollup,rolldown,webpack,rspack,esbuild,farm}` — the `typebook()` bundler plugin (one unplugin factory) that runs the scan and the sub-plugins.

  The stories/docs API (`defineStories`, `@dennation/typebook/react`) and the `snippets` plugin exist in the repo but are **not** part of this release's published surface.
