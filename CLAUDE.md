# @dennation/ui-studio — monorepo

pnpm workspace monorepo.

## Commands (root)

```bash
pnpm install         # Install all workspace dependencies
pnpm run build       # Build all packages (studio first, then examples)
pnpm run dev         # Dev mode for all packages in parallel
pnpm run typecheck   # Type-check all packages
```

## Workspace structure

```
packages/
  studio/      — @dennation/ui-studio (library + Vite/Webpack plugins)
examples/
  vite/        — @dennation/example-vite (Vite app using studio)
  webpack/     — @dennation/example-webpack (Webpack app using studio)
  mdx/         — @dennation/example-mdx (Vite app with markdown docs)
```

## Root files

- **`package.json`** — Workspace root. Private, delegates scripts to packages via `pnpm -r`.
- **`pnpm-workspace.yaml`** — Declares `packages/*` and `examples/*` as workspace members.
- **`.gitignore`** — Ignores `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`.

---

## packages/studio

React component story tool with automatic variant generation from TypeScript types.

### Commands

```bash
pnpm --filter @dennation/ui-studio build       # Build with Vite (5 entry points)
pnpm --filter @dennation/ui-studio dev         # Build in watch mode
pnpm --filter @dennation/ui-studio typecheck   # Type-check without emit
```

### Architecture

```
packages/studio/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts                  — Public package exports (define, definePage, types)
    types.ts                  — All shared types (DefineResult, PageResult, Story, StoryConfig, PropInfo, ComponentMeta, Registry, etc.)
    define.ts                 — define() → DefineResult with single(), variants(), matrix(), allOf(), values(), generate()
    definePage.ts             — definePage() → PageResult for standalone documentation pages
    action.ts                 — ActionStore singleton (log, clear, subscribe) for action event logging
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into variant arrays (used by renderers)
    constants.ts              — Shared constants (PACKAGE_NAME, DEFAULT_PAGES_INCLUDE, etc.)
    cli.ts                    — CLI entry: `npx @dennation/ui-studio generate`
    core/
      compiler.ts             — StudioCompiler class: shared lifecycle, type caching, gen file writing
      scanner.ts              — Glob scanner for .stories.tsx + .page.tsx files + oxc AST analysis
      generator.ts            — Generates ui-studio-registry.gen.ts and ui-studio-meta.gen.ts content
      ts-client.ts            — TypeScript Compiler API client for type extraction
      type-parser.ts          — Converts TS type strings → PropInfo[] via oxc
    plugins/
      vite/
        index.ts              — Vite plugin: thin wrapper around StudioCompiler + virtual module + dev watcher
      webpack/
        index.ts              — Webpack plugin: UiStudioWebpackPlugin class wrapping StudioCompiler
    react/
      index.ts                — React exports
      context.ts              — StudioMetaContext (Component → ComponentMeta map) + StudioWrapperContext (global storyWrapper) + InspectContext (inspect panel state) + CodeThemeContext (shiki themes)
      components/
        index.ts              — Barrel export
        Studio.tsx            — <Studio /> component (per-story sidebar tree, theme, single-story rendering, inspect panel)
        Story.tsx             — <Story of={...} /> component for embedding stories in doc pages
        StoryRenderer.tsx     — Dispatches to RenderSingle / RenderVariants / RenderMatrix
        Playground.tsx        — <Playground of={defineResult} /> interactive component preview with props panel
        ComponentPreview.tsx  — Unified component render: action wrapping, storyWrapper, ErrorBoundary, IsolateWrapper, inspect button, registers componentName/propInfos
        CodePreview.tsx       — Shiki-highlighted code block with line numbers and copy button
        InspectPanel.tsx      — Always-visible right sidebar: Props table, Code preview (generated JSX), Action log with filter
        PropControl.tsx       — Prop controls: dropdown (literal), toggle (boolean), input (string), number
        VariantCard.tsx       — Single variant preview card with label badge, delegates rendering to ComponentPreview
        IframePreview.tsx     — Iframe wrapper for CSS isolation of component previews
        ErrorBoundary.tsx     — Error boundary for component crash isolation
      hooks/
        useHashRoute.ts       — Hash-based routing: #component/name (page or story, pages win) + #page/page-name → activeComponent/activeStory/activeComponentPage/activePage
        useActionLog.ts       — Hook: filtered ActionLogEntry[] by previewId via useSyncExternalStore
      utils/
        index.ts              — Barrel export
        buildSidebarTree.ts   — Builds sidebar tree: unified SidebarNode discriminated union (group | component | page | story)
        resolveComponentPages.ts — Generates default docs pages for components, handles user overrides
        wrapActionProps.ts    — Wraps function props with action logging, auto-generates stubs for missing function props
        generateJsx.ts        — Generates JSX code string from component name + props (for code preview)
        naming.ts             — toKebabCase(), entryName() helpers
        getGridStyle.ts       — getGridStyle() — computes CSS grid layout for variant grids
      styles/
        styles.css            — Studio UI styles (Tailwind)
```

### Build entry points

- **`index`** — Library exports (`define`, `definePage`, types). Consumed by user code and generated `.gen.ts`.
- **`react/index`** — `<Studio />` component, `<Story />` component, `<Playground />` component, `<CodePreview />` component, `ErrorBoundary`.
- **`plugins/vite`** — Vite plugin (`uiStudio()`). Thin wrapper around `StudioCompiler`.
- **`plugins/webpack`** — Webpack plugin (`UiStudioWebpackPlugin`). Thin wrapper around `StudioCompiler`.
- **`cli/index`** — CLI entry: `npx @dennation/ui-studio generate`.

### Package exports

- `@dennation/ui-studio` — define, definePage, types (ComponentMeta, Registry, ComponentEntry, etc.)
- `@dennation/ui-studio/react` — Studio component, Story component, Playground component
- `@dennation/ui-studio/vite` — uiStudio Vite plugin
- `@dennation/ui-studio/webpack` — UiStudioWebpackPlugin

### Data flow

```
.stories.tsx  →  plugin scans files  →  analyzeStoryFile()
.page.tsx     →  plugin scans files  →  analyzePageFile()
                                              ↓
                                    TypeScript Compiler API  →  type string (stories only)
                                              ↓
                                    oxc parse  →  PropInfo[]
                                              ↓
                                    generateMetaFile()       →  ui-studio-meta.gen.ts (extracted types)
                                    generateRegistryFile()   →  ui-studio-registry.gen.ts (imports + assembly + pages)
                                              ↓
                                    <Studio />  resolveComponentPages() → auto-generated docs + overrides
                                              sidebar tree → click story          → #component/story-name hash
                                                           → click component page → #component/page-name hash (pages win over stories)
                                                           → click page           → #page/page-name hash
                                              ↓
                                    Stories: RenderSingle / RenderVariants / RenderMatrix
                                    Pages & component pages: render page content component directly
                                           (may contain <Story of={...} /> or <Playground of={...} /> → resolves PropInfo via StudioMetaContext)
```

### Key design decisions

- **Bundler plugins (Vite + Webpack)** — thin wrappers around `StudioCompiler` (`core/compiler.ts`). The compiler handles TS client lifecycle, type caching, file scanning, and gen file writing. Each plugin just wires compiler methods into bundler-specific hooks. Vite plugin additionally provides a virtual module (`virtual:ui-studio-registry`).
- **StudioCompiler** — shared core class extracted from the original Vite plugin. Encapsulates: `start()` (init TS client + first generation), `stop()` (cleanup), `regenerate(changedFile?)` (full regen cycle), `debouncedRegenerate()` (watch mode), type cache management.
- **Type extraction via TS Compiler API** — uses TypeScript Compiler API directly (`ts-client.ts`) to get component prop types as strings. These strings are parsed by oxc into structured `PropInfo[]`.
- **Two generated files on disk (not virtual modules)** — `ui-studio-registry.gen.ts` (imports stories/configs, exports `Registry` object with `components` array) and `ui-studio-meta.gen.ts` (extracted component metadata keyed by file path). Registry imports meta internally — user only imports registry. Both paths are independently configurable via `output` and `metaOutput`. Files are **physical and committed to git** — not Vite virtual modules. Reasons: (1) `tsc --noEmit` runs before Vite in build scripts, so it needs real files to typecheck against — virtual modules are invisible to `tsc`; (2) gen files are the primary debugging tool for type extraction — when props don't appear, you open `ui-studio-meta.gen.ts` and immediately see what was extracted; (3) PR diffs show exactly what changed in extracted types; (4) clone-and-build works without running Vite first. This matches TanStack Router's approach with `routeTree.gen.ts`. HMR works naturally — Vite's file watcher picks up gen file changes after `writeIfChanged()`, and the guard in the plugin prevents infinite regen cycles.
- **Documentation pages** — standalone `.page.tsx` files using `definePage({ name, path?, order?, content })`. Pages appear in the sidebar alongside components, grouped by `path`. No type extraction needed — pages are pure React components. Hash route format: `#page/page-name`. For markdown content, users can import `.md` files via `@mdx-js/rollup` (configured by the user, not built-in). Doc pages can embed stories via `<Story of={...} />`.
- **`<Story />` component and StudioMetaContext** — `<Story of={storyExport} />` renders any story inside a doc page. It reads `PropInfo[]` from `StudioMetaContext` (provided by `<Studio />`) to resolve `allOf()` variant markers. Without context (e.g. outside `<Studio />`), falls back to empty props — single stories still render, variant/matrix stories render empty grids gracefully.
- **Hidden stories** — stories with `hidden: true` are excluded from the sidebar tree (`buildSidebarTree` skips them) but remain in the registry and are fully importable for use in doc pages via `<Story of={...} />`.
- **StoryConfig shared type** — common config fields (`props`, `isolate`, `name`, `path`, `hidden`) are extracted into `StoryConfig<Props, CoveredByDefaults>`. Each `DefineResult` method (`single`, `variants`, `matrix`) extends it with method-specific fields.
- **Self-contained stories** — each story (single/variants/matrix) carries its own `component` reference and `defaults`, making stories reusable without the DefineResult.
- **Lazy variant resolution** — each story kind renderer (RenderSingle, RenderVariants, RenderMatrix) resolves its own VariantConfig markers inline using `resolveVariantConfig()`. No upfront resolution step — variants are only computed for the story being displayed.
- **Iframe isolation opt-in** — variant cards render inline by default. Add `isolate: true` to a story to render inside an iframe (`IframePreview`) for full CSS/JS isolation. Only needed for components that interact with document/body (modals, dropdowns with portals). Studio's `st:` Tailwind prefix already prevents style bleeding for normal components.
- **Error Boundary** — React error boundaries isolate component crashes per variant.
- **VariantConfig marker pattern** — `button.allOf('size')` returns a typed marker `{ __type: 'allOf', prop: 'size' }` that gets resolved at render time by the story renderer using TS-extracted type data.
- **Three story kinds** — `single` (one card), `variants` (grid of values for one prop), `matrix` (table: x prop × y props).
- **Per-story pages** — each story is a separate page. Sidebar shows a tree: path groups → components → stories. Clicking a story navigates to `#component/story` hash route and renders only that story.
- **`<Playground />` component** — `<Playground of={defineResult} />` renders an interactive component preview with a props control table. Takes a `DefineResult` via the `of` prop, reads `PropInfo[]` from `StudioMetaContext`. Exported from `@dennation/ui-studio/react` for embedding in doc pages. Used internally by the auto-generated Docs page.
- **Component pages** — pages can be associated with a component and appear inside its sidebar section. In the unified `SidebarNode` tree, component pages are `type: 'page'` nodes nested inside `type: 'component'` nodes. The sidebar renderer derives routing context (component-page vs top-level page) from tree position. `resolveComponentPages()` builds the component→pages mapping.
- **Auto-generated API page** — each component gets a real `PageResult` (`DEFAULT_DOCS_PAGE` constant = 'API') as its first sidebar page. The content renders `<Playground of={config} />`. Disable per-component with `autoDocs: false` in `define()`. Override by creating a `.page.tsx` with `name: DEFAULT_DOCS_PAGE` and `path: '{componentPath}/{componentName}'`. Clicking a component name auto-selects its API page.
- **Story path grouping** — stories can set `path` to group them under sub-sections in the sidebar (e.g. `path: 'Matrix'`). Default path is `'Stories'`. When all stories share the same path (single group), the group level is flattened — stories appear directly under the component.
- **Story config fields** — all story kinds share common config via `StoryConfig`: `props`, `isolate`, `name`, `path`, `hidden`. Each kind adds its own fields: `single` adds `render`, `variants` adds `items`/`columns`, `matrix` adds `x`/`y`.
- **Global storyWrapper** — `<Studio storyWrapper={...} />` provides a global wrapper for all stories and Playground previews via `StudioWrapperContext`. Applied at render time in `ComponentPreview` (not baked into story objects). Composition order: global `storyWrapper` → per-component `wrapper` (baked into `story.render` at `define()` time) → component render. Uses React Context to avoid prop drilling through StoryRenderer/MainContent.
- **Automatic action logging** — all function props are automatically wrapped with logging in `ComponentPreview` via `wrapActionProps()`. Existing functions are wrapped (log + call original), missing function props (known from `PropInfo` with `kind: 'function'`) get auto-generated logging stubs. Action name = prop key (e.g. `onClick`, `onChange`). No manual setup needed. Disable per-component with `trackActions: false` in `define()`.
- **ActionStore** — framework-agnostic singleton (`action.ts`) with immutable entries array and pub-sub via `Set<Listener>`. React subscribes via `useSyncExternalStore`. Each log entry has `{ id, timestamp, actionName, previewId, formattedArgs, inherited }`. Args are serialized to string at log time (not at render time) to prevent freezes on large objects like DOM events. `previewId` is injected by `wrapActionProps` at render time to scope entries per preview instance.
- **ComponentMeta** — includes `componentName` (extracted by scanner from the first argument of `define()` calls, e.g. `define(Switch, ...)` → `"Switch"`) and `props: PropInfo[]`. The `componentName` is the real import identifier — not `displayName` (which may include namespace prefix) and not `component.name` (which is empty for HOC-wrapped components).
- **StudioMetaContext** — provides `Map<ComponentType, ComponentMeta>` to the component tree. Used by `ComponentPreview` (component name + propInfos), `Playground` (prop controls), and `Story` (variant resolution).
- **ComponentPreview** — unified component rendering used by both `VariantCard` and `Playground`. Handles: `wrapActionProps` (action logging + stub generation), `storyWrapper` application, `IsolateWrapper` (conditional iframe), `ErrorBoundary`, and inspect button. Reads `InspectContext` to show/highlight the inspect button — no prop drilling needed. Registers current props, propInfos, and componentName (from `ComponentMeta`) in shared refs for `InspectPanel` to read.
- **Inspect Panel** — always-visible right sidebar (resizable, default 30% width, min 20%). Three resizable vertical sections: Props (current props of inspected preview), Code (live JSX generated from component name + props via `generateJsx`, highlighted with shiki), Log (chronological action entries with filter dropdown). When no preview is selected, shows "Click a preview to inspect" placeholder. Action log filter: checkboxes per action name, inherited actions hidden by default, "Select all" toggle. Actions are populated from PropInfo (available immediately) + logged entries.
- **InspectContext** — provides `{ inspectedPreviewId, onInspect, previewPropsRef, previewPropInfosRef, previewComponentNamesRef }` to the component tree. `ComponentPreview` reads it to render the inspect button and determine `isInspected` state. Avoids threading inspect props through `StoryRenderer` → `RenderVariants` → `VariantCard`. Shared refs: `previewPropsRef` (props per previewId), `previewPropInfosRef` (PropInfo[] per previewId), `previewComponentNamesRef` (component name per previewId) — `ComponentPreview` writes via `useEffect`, `InspectPanel` reads.
- **Code preview (shiki)** — `CodePreview` component renders JSX code with syntax highlighting via shiki. Dual-theme support: CSS variables (`--shiki-light`/`--shiki-dark`) mapped to `[data-theme]` attribute. Line numbers via CSS counters. Copy button with "Copied!" feedback. Module-level singleton highlighter (lazy loaded). Configurable themes via `<Studio codeTheme={{ light, dark }} />` prop and `CodeThemeContext`.
- **`codeTheme` prop** — `<Studio codeTheme={{ light?: string, dark?: string }} />` configures shiki themes for code preview. Defaults to `{ light: 'github-light', dark: 'github-dark' }`. Shiki is externalized in the build (resolved by consuming bundler).
- **Iframe isolation + actions** — action functions are closures created in the parent frame's module scope. `IframePreview` uses `createPortal` which only moves DOM nodes — JS execution context stays in the parent. Actions from iframe-isolated components naturally flow to the parent's `ActionStore` with no special handling.

---

## examples/vite

Vite + React app for testing studio locally. Uses `@dennation/ui-studio` as a workspace dependency. Components come from `@heroui/*` external library.

### Commands

```bash
pnpm --filter @dennation/example-vite dev       # Start Vite dev server
pnpm --filter @dennation/example-vite build     # Type-check + production build
pnpm --filter @dennation/example-vite preview   # Preview production build
```

### Structure

```
examples/vite/
  package.json
  tsconfig.json
  vite.config.ts                — Vite config with uiStudio()
  index.html
  src/
    main.tsx                    — Vite entry point
    App.tsx                     — Demo app
    hero.ts                     — HeroUI provider/theme setup
    stories/
      Button.stories.tsx        — Stories for @heroui/button
      Checkbox.stories.tsx      — Stories for @heroui/checkbox
      Input.stories.tsx         — Stories for @heroui/input
      Switch.stories.tsx        — Stories for @heroui/switch
    docs/
      GettingStarted.page.tsx   — Example documentation page
```

---

## examples/webpack

Webpack + React app for testing the webpack plugin. Uses a simple local Button component (no external UI library dependency).

### Commands

```bash
pnpm --filter @dennation/example-webpack dev       # Start webpack-dev-server on port 3001
pnpm --filter @dennation/example-webpack build     # Production build
pnpm --filter @dennation/example-webpack typecheck  # Type-check without emit
```

### Structure

```
examples/webpack/
  package.json
  tsconfig.json
  webpack.config.mjs              — Webpack config with UiStudioWebpackPlugin
  src/
    index.html                    — HTML template
    main.tsx                      — Entry point
    App.tsx                       — Renders <Studio />
    components/
      Button.tsx                  — Simple local Button component
    stories/
      Button.stories.tsx          — Stories for Button
```

---

## examples/mdx

Vite + React app demonstrating `.page.tsx` pages with imported `.md` markdown content via `@mdx-js/rollup`. Self-contained with a local Button component (no external UI library dependency).

### Commands

```bash
pnpm --filter @dennation/example-mdx dev       # Start Vite dev server
pnpm --filter @dennation/example-mdx build     # Type-check + production build
pnpm --filter @dennation/example-mdx typecheck  # Type-check without emit
pnpm --filter @dennation/example-mdx preview   # Preview production build
```

### Structure

```
examples/mdx/
  package.json
  tsconfig.json
  vite.config.ts                — Vite config with mdx() + react() + uiStudio()
  index.html
  src/
    main.tsx                    — Entry point
    App.tsx                     — Renders <Studio />
    mdx.d.ts                   — Type declarations for *.md modules
    components/
      Button.tsx                — Simple local Button component
    stories/
      Button.stories.tsx        — Stories for Button (includes hidden story for docs)
    docs/
      GettingStarted.page.tsx   — Getting started guide with embedded <Story /> demos
      getting-started.md        — Markdown content for getting started
      ButtonGuide.page.tsx      — Button component guide with all story variants
      button-guide.md           — Markdown content for button guide
      Theming.page.tsx          — Theming and isolation mode guide
      theming.md                — Markdown content for theming
      Changelog.page.tsx        — Changelog page
      changelog.md              — Markdown content for changelog
```

---

## User-facing API

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { uiStudio } from '@dennation/ui-studio/vite'

export default defineConfig({
  plugins: [
    react(),
    uiStudio({
      stories: './src/**/*.stories.tsx',        // default
      pages: './src/**/*.page.tsx',             // default
      output: './ui-studio-registry.gen.ts',   // default
      metaOutput: './ui-studio-meta.gen.ts',   // default
    }),
  ],
})
```

### webpack.config.mjs

```js
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { UiStudioWebpackPlugin } from '@dennation/ui-studio/webpack'

export default {
  // ... your webpack config ...
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new UiStudioWebpackPlugin({
      stories: './src/**/*.stories.tsx',        // default
      pages: './src/**/*.page.tsx',             // default
      output: './ui-studio-registry.gen.ts',   // default
      metaOutput: './ui-studio-meta.gen.ts',   // default
    }),
  ],
}
```

### Component.stories.tsx

```ts
import { define } from '@dennation/ui-studio'
import { Button } from '@heroui/button'

const button = define(Button, {
  name: 'Button',
  path: 'Forms',
  defaults: { children: 'Click me' },
  props: ['size', 'variant', 'color'],
})

// Single story — one card with fixed props
export const Default = button.single({ props: { size: 'md', variant: 'solid' } })

// Variants story — grid of all values for a prop (from TS type)
export const Sizes = button.variants({ items: button.allOf('size') })

// Variants story — manual values, custom columns
export const Colors = button.variants({ items: button.allOf('color'), columns: 3 })

// Variants story — manual list of values
export const States = button.variants({ items: button.values('disabled', [false, true]) })

// Matrix story — custom name and path group
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant')],
  name: 'Color × Variant',
  path: 'Matrix',
})

// Hidden story — excluded from sidebar, usable in docs via <Story of={Disabled} />
export const Disabled = button.variants({
  items: button.values('disabled', [false, true]),
  hidden: true,
})

export default button
```

### Page.page.tsx

```tsx
import { definePage } from '@dennation/ui-studio'
import { Story, Playground } from '@dennation/ui-studio/react'
import button, { Default, Sizes, Disabled } from '../stories/Button.stories'

export default definePage({
  name: 'Button Guide',
  path: 'Guides',       // optional: sidebar grouping
  order: 1,             // optional: sort order within group
  content: () => (
    <div>
      <h1>Button Guide</h1>
      <Playground of={button} />           {/* interactive props panel */}
      <Story of={Default} />
      <h2>Sizes</h2>
      <Story of={Sizes} />
      <h2>Disabled state</h2>
      <Story of={Disabled} />   {/* hidden story — only appears here, not in sidebar */}
    </div>
  ),
})
```

### Override auto-generated Docs page

```tsx
// To override the auto-generated Docs page for a component:
// Use name: 'API' and path: '{componentPath}/{componentName}'
import { definePage } from '@dennation/ui-studio'
import { Playground } from '@dennation/ui-studio/react'
import button from '../stories/Button.stories'

export default definePage({
  name: 'API',               // must match DEFAULT_DOCS_PAGE
  path: 'Forms/Button',      // must match componentPath/componentName
  content: () => (
    <div>
      <h1>Custom Button Docs</h1>
      <Playground of={button} />
      <p>Additional custom documentation...</p>
    </div>
  ),
})
```

### Disable auto-generated Docs page

```ts
// Set autoDocs: false in define() to disable auto-generated Docs page
const button = define(Button, {
  name: 'Button',
  path: 'Forms',
  autoDocs: false,   // no auto-generated Docs page
  defaults: { children: 'Click me' },
})
```

### Disable action logging

```ts
// Set trackActions: false in define() to disable automatic action logging
const button = define(Button, {
  name: 'Button',
  path: 'Forms',
  trackActions: false,   // function props won't be logged
  defaults: { children: 'Click me' },
})
```

### Variant config helpers

- `button.allOf('size')` — auto-generate all values from TypeScript prop type
- `button.values('size', ['sm', 'md', 'lg'])` — manual list of values
- `button.generate('size', () => randomValue(), 5)` — generate N values via function
