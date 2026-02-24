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
    index.ts                  — Public package exports (define, describe (deprecated), definePage, types)
    types.ts                  — All shared types (DefineResult, PageResult, Story, PropInfo, ComponentMeta, Registry, etc.)
    define.ts                 — define() → DefineResult with single(), variants(), matrix(), allOf(), values(), generate()
    describe.ts               — Deprecated re-export of define() as describe()
    definePage.ts             — definePage() → PageResult for standalone documentation pages
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into variant arrays (used by renderers)
    constants.ts              — Shared constants (PACKAGE_NAME, DEFAULT_PAGES_INCLUDE, etc.)
    cli.ts                    — CLI entry: `npx @dennation/ui-studio generate`
    core/
      compiler.ts             — StudioCompiler class: shared lifecycle, type caching, gen file writing
      scanner.ts              — Glob scanner for .stories.tsx + .docs.tsx files + oxc AST analysis
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
      components/
        index.ts              — Barrel export
        Studio.tsx            — <Studio /> component (per-story sidebar tree, theme, single-story rendering)
        StoryRenderer.tsx     — Dispatches to RenderSingle / RenderVariants / RenderMatrix
        ComponentPreview.tsx   — Component preview with interactive props panel
        PropControl.tsx       — Prop controls: dropdown (literal), toggle (boolean), input (string), number
        VariantCard.tsx       — Single variant preview card (inline by default, iframe when isolate: true)
        IframePreview.tsx     — Iframe wrapper for CSS isolation of component previews
        ErrorBoundary.tsx     — Error boundary for component crash isolation
      hooks/
        useHashRoute.ts       — Hash-based routing: #component/story + #page/page-name → activeComponent/activeStory/activePage
      utils/
        index.ts              — Barrel export
        buildSidebarTree.ts   — Builds sidebar tree: path groups → ComponentNode + PageNode → StoryGroup → StoryItem
        naming.ts             — toKebabCase(), entryName(), pageName() helpers
        getGridStyle.ts       — getGridStyle() — computes CSS grid layout for variant grids
      styles/
        styles.css            — Studio UI styles (Tailwind)
```

### Build entry points

- **`index`** — Library exports (`define`, `describe` (deprecated), `definePage`, types). Consumed by user code and generated `.gen.ts`.
- **`react/index`** — `<Studio />` component, `ErrorBoundary`.
- **`plugins/vite`** — Vite plugin (`uiStudio()`). Thin wrapper around `StudioCompiler`.
- **`plugins/webpack`** — Webpack plugin (`UiStudioWebpackPlugin`). Thin wrapper around `StudioCompiler`.
- **`cli/index`** — CLI entry: `npx @dennation/ui-studio generate`.

### Package exports

- `@dennation/ui-studio` — define, describe (deprecated), definePage, types (ComponentMeta, Registry, ComponentEntry, PageEntry, etc.)
- `@dennation/ui-studio/react` — Studio component
- `@dennation/ui-studio/vite` — uiStudio Vite plugin
- `@dennation/ui-studio/webpack` — UiStudioWebpackPlugin

### Data flow

```
.stories.tsx  →  plugin scans files  →  analyzeStoryFile()
.docs.tsx     →  plugin scans files  →  analyzePageFile()
                                              ↓
                                    TypeScript Compiler API  →  type string (stories only)
                                              ↓
                                    oxc parse  →  PropInfo[]
                                              ↓
                                    generateMetaFile()       →  ui-studio-meta.gen.ts (extracted types)
                                    generateRegistryFile()   →  ui-studio-registry.gen.ts (imports + assembly + pages)
                                              ↓
                                    <Studio />  sidebar tree → click story → #component/story hash
                                                             → click page  → #page/page-name hash
                                              ↓
                                    Stories: RenderSingle / RenderVariants / RenderMatrix
                                    Pages: render page content component directly
```

### Key design decisions

- **Bundler plugins (Vite + Webpack)** — thin wrappers around `StudioCompiler` (`core/compiler.ts`). The compiler handles TS client lifecycle, type caching, file scanning, and gen file writing. Each plugin just wires compiler methods into bundler-specific hooks. Vite plugin additionally provides a virtual module (`virtual:ui-studio-registry`).
- **StudioCompiler** — shared core class extracted from the original Vite plugin. Encapsulates: `start()` (init TS client + first generation), `stop()` (cleanup), `regenerate(changedFile?)` (full regen cycle), `debouncedRegenerate()` (watch mode), type cache management.
- **Type extraction via TS Compiler API** — uses TypeScript Compiler API directly (`ts-client.ts`) to get component prop types as strings. These strings are parsed by oxc into structured `PropInfo[]`.
- **Two generated files on disk (not virtual modules)** — `ui-studio-registry.gen.ts` (imports stories/configs, exports `Registry` object with `components` array) and `ui-studio-meta.gen.ts` (extracted component metadata keyed by file path). Registry imports meta internally — user only imports registry. Both paths are independently configurable via `output` and `metaOutput`. Files are **physical and committed to git** — not Vite virtual modules. Reasons: (1) `tsc --noEmit` runs before Vite in build scripts, so it needs real files to typecheck against — virtual modules are invisible to `tsc`; (2) gen files are the primary debugging tool for type extraction — when props don't appear, you open `ui-studio-meta.gen.ts` and immediately see what was extracted; (3) PR diffs show exactly what changed in extracted types; (4) clone-and-build works without running Vite first. This matches TanStack Router's approach with `routeTree.gen.ts`. HMR works naturally — Vite's file watcher picks up gen file changes after `writeIfChanged()`, and the guard in the plugin prevents infinite regen cycles.
- **Documentation pages** — standalone `.docs.tsx` files using `definePage({ name, path?, order?, content })`. Pages appear in the sidebar alongside components, grouped by `path`. No type extraction needed — pages are pure React components. Hash route format: `#page/page-name`. For markdown content, users can import `.md` files via `@mdx-js/rollup` (configured by the user, not built-in).
- **Self-contained stories** — each story (single/variants/matrix) carries its own `component` reference and `defaults`, making stories reusable without the DefineResult.
- **Lazy variant resolution** — each story kind renderer (RenderSingle, RenderVariants, RenderMatrix) resolves its own VariantConfig markers inline using `resolveVariantConfig()`. No upfront resolution step — variants are only computed for the story being displayed.
- **Iframe isolation opt-in** — variant cards render inline by default. Add `isolate: true` to a story to render inside an iframe (`IframePreview`) for full CSS/JS isolation. Only needed for components that interact with document/body (modals, dropdowns with portals). Studio's `st:` Tailwind prefix already prevents style bleeding for normal components.
- **Error Boundary** — React error boundaries isolate component crashes per variant.
- **VariantConfig marker pattern** — `button.allOf('size')` returns a typed marker `{ __type: 'allOf', prop: 'size' }` that gets resolved at render time by the story renderer using TS-extracted type data.
- **Three story kinds** — `single` (one card), `variants` (grid of values for one prop), `matrix` (table: x prop × y props).
- **Per-story pages** — each story is a separate page. Sidebar shows a tree: path groups → components → stories. Clicking a story navigates to `#component/story` hash route and renders only that story.
- **Auto-generated Docs page** — each component gets a virtual "Docs" page (`DOCS_PAGE` constant) as the first sidebar item. Shows `ComponentPreview` with interactive props panel. Clicking a component name auto-selects its Docs page. The Docs page is not a real story — it's handled specially by the router and Studio. (Future: make it disableable or replaceable with custom content.)
- **Story path grouping** — stories can set `path` to group them under sub-sections in the sidebar (e.g. `path: 'Matrix'`). Default path is `'Stories'`. When all stories share the same path (single group), the group level is flattened — stories appear directly under the component.

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
      GettingStarted.docs.tsx   — Example documentation page
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

Vite + React app demonstrating `.docs.tsx` pages with imported `.md` markdown content via `@mdx-js/rollup`. Self-contained with a local Button component (no external UI library dependency).

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
      Button.stories.tsx        — Stories for Button
    docs/
      GettingStarted.docs.tsx   — Doc page with definePage() + imported markdown + live Button
      getting-started.md        — Markdown content imported by the docs page
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
      include: './src/**/*.stories.tsx',        // default
      includePages: './src/**/*.docs.tsx',       // default
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
      include: './src/**/*.stories.tsx',        // default
      includePages: './src/**/*.docs.tsx',      // default
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

export default button
```

### Page.docs.tsx

```tsx
import { definePage } from '@dennation/ui-studio'

export default definePage({
  name: 'Getting Started',
  path: 'Guides',       // optional: sidebar grouping
  order: 1,             // optional: sort order within group
  content: () => (
    <div>
      <h1>Getting Started</h1>
      <p>Welcome to the project</p>
    </div>
  ),
})
```

### Variant config helpers

- `button.allOf('size')` — auto-generate all values from TypeScript prop type
- `button.values('size', ['sm', 'md', 'lg'])` — manual list of values
- `button.generate('size', () => randomValue(), 5)` — generate N values via function
