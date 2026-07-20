# @dennation/typebook

## 0.5.0

### Minor Changes

- a66916f: Consistent location context for the `llmInstructions` callbacks:

  - `ComponentInfo` gains **`dir`** — the component's own folder (the directory of `sourceFile`). Available to every callback, so none has to re-derive it from `sourceFile` by hand.
  - `entryPath` and `importFrom` now take the same second argument **`{ root }`** (the project root) — the only environment value a path/specifier builder needs. Co-locate with `component.dir`, or build a central path from `root`; derive an import subpath with `` `@acme/ui/${path.relative(root, c.dir)}` ``.

  The old `EntryPathContext.componentDir` is gone (use `component.dir`); `entryPath: (c) => path.join(c.dir, ...)` for co-location. `filterComponents`/`format` stay `(component)` — they get `component.dir` too, no unused `root`.

## 0.4.0

### Minor Changes

- 187ab58: `llmInstructions`: add `emitToOutDir?: boolean | string` (default `false`) — also write a published copy of the docs into the bundler's output directory. The main `entryPath`/`indexPath` output stays your committed-in-source copy (for review); `emitToOutDir: true` writes a flat copy (`{Name}.md` + `index.md`, same content) to the output dir's root, a string to a subdirectory of it. `build` only (ignored in dev), written at `writeBundle` so it survives `emptyOutDir`; if the output dir is unknown (a non-Vite bundler) it warns and skips (fails with `failOnError`).

  `GenerateCtx` gains `outDir?: string` — the resolved output directory, populated in `build` when the bundler exposes it (Vite).

## 0.3.0

### Minor Changes

- 91087e0: `ComponentInfo` gains `sourceFile` — the scanned module a component was found in (the glob-matched file), distinct from `file` (its declaration). For a re-exported third-party component (`export { Toaster } from "sonner"`) `file` points into `node_modules` while `sourceFile` stays your module, so `out`/`importFrom` can derive paths reliably and re-exports are detectable (`file` outside your project, `sourceFile` inside it). The co-located `out` recipe now uses `doc.sourceFile`.
- 713bddd: Default prop filter: hide the `element` group (per-tag native attributes) too, so an inherited card no longer lists DOM noise like `formEncType`/`popoverTarget`. The broadly useful natives — `disabled`, `type`, `name`, `value`, `placeholder`, `required`, `readOnly`, `checked`, `href`, `htmlFor` — are rescued via `DEFAULT_KEPT_PROPS`. A component's own props are unaffected (they're ungrouped, always kept).
- 002815b: `llmInstructions`: add `filterComponents: (component) => boolean` to drop whole components (deprecated ones, foreign re-exports) from the cards and index.

  `typebook`: add `failOnError` — a plugin whose `generate` throws now warns and keeps the build green by default; set `failOnError: true` to fail the build in CI.

  Default prop filter: hide the `react` group again (`ref`/`key` are noise in an agent's card) while keeping `children` via `DEFAULT_KEPT_PROPS`.

- cf4f2d8: `filterProps` becomes a **map** (`Record<string, boolean>`) keyed by group or prop name — `true` keeps, `false` hides, a prop name wins over its group, anything unlisted is kept — overridable by object spread (`{ ...DEFAULT_PROP_FILTER, formEncType: true }`). A predicate `(prop, component) => boolean` is still accepted for arbitrary logic. `hideGroups(groups)` now returns such a map (its `except` option is gone — spread the kept names instead), and `DEFAULT_KEPT_PROPS` is a map (`{ children: true, … }`).

  New `keepOwnProps` option (default `true`): a component's own props always show; set `false` to filter them by group too. To make this possible, the scanner now classifies a `group` for **every** prop (own props included); `inheritedFrom` remains the own/inherited signal.

- 78f2fea: `llmInstructions`: the output options are reworked. `entryPath` (was `out`) is now a **function you write** — `(component, { componentDir, root }) => string` — that returns the **full** card path, so the filename is explicit and nothing is appended under the hood. Join `componentDir` to co-locate (`path.join(componentDir, c.name + ".md")`) or `root` for a central folder; an absolute return is used as-is, a relative one resolves against `root`. `indexFile` is renamed to `indexPath` (the index, relative to the project root; `false` to skip). `ComponentInfo` gains nothing; a new `EntryPathContext` type is exported.

### Patch Changes

- 3d758ef: Fix cards written into `outDir` (e.g. `dist/`) being silently wiped in production builds. The plugin emitted at `buildStart`, before the bundler empties `outDir`. It now emits at `writeBundle` in `build` (after the output dir is cleared and the bundle written) while keeping `buildStart` + watcher in `dev`.
- ab226da: `llmInstructions`: rename the callback parameter `doc` → `component` in `out`/`importFrom` (it's a `ComponentInfo`, and the other callbacks — `format`, `filterComponents`, `filterProps` — already use `component`). Signature-only; no behaviour change.

## 0.2.0

### Minor Changes

- 68b0c4f: `llmInstructions`: add a `format` option — `(component: ComponentInfo) => string` — to control each file's contents. Defaults to `markdownFormat` (the built-in card); `importFrom`/`filterProps` configure that default. Pass your own to emit JSON, MDX, or any other shape. `markdownFormat` and the `LlmFormat` type are exported so the default can be wrapped instead of rewritten.

## 0.1.0

### Minor Changes

- 2249c3e: Initial release: the component **scanner** and the **AI instructions** plugin.

  - `@dennation/typebook` — the scanner core: point `typebook({ components })` at your components (glob) and it extracts every exported React component's prop types, defaults and JSDoc by type (no wrapper call). Exposes `collectComponentInfos`, `componentToMarkdown`, `TypeScriptClient`, plus the React-free types (`TypebookConfig`, `ComponentInfo`, `TypebookPlugin`, …).
  - `@dennation/typebook/plugins/llm-instructions` — `llmInstructions()` generates one Markdown card per component (props table + description + deprecation) plus an index, as context for AI agents (Claude Code, Codex).
  - `@dennation/typebook/{vite,rollup,rolldown,webpack,rspack,esbuild,farm}` — the `typebook()` bundler plugin (one unplugin factory) that runs the scan and the sub-plugins.

  The stories/docs API (`defineStories`, `@dennation/typebook/react`) and the `snippets` plugin exist in the repo but are **not** part of this release's published surface.
