# @dennation/studio — monorepo

pnpm workspace monorepo with two packages.

## Commands (root)

```bash
pnpm install         # Install all workspace dependencies
pnpm run build       # Build all packages (studio first, then playground)
pnpm run dev         # Dev mode for all packages in parallel
pnpm run typecheck   # Type-check all packages
```

## Workspace structure

```
packages/
  studio/      — @dennation/studio (library + Vite plugin)
  playground/  — @dennation/playground (Vite app using studio)
```

## Root files

- **`package.json`** — Workspace root. Private, delegates scripts to packages via `pnpm -r`.
- **`pnpm-workspace.yaml`** — Declares `packages/*` as workspace members.
- **`.gitignore`** — Ignores `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`, `studio.gen.ts`.

---

## packages/studio

React component story tool with automatic variant generation from TypeScript types.

### Commands

```bash
pnpm --filter @dennation/studio build       # Build with tsup (5 entry points)
pnpm --filter @dennation/studio dev         # Build in watch mode
pnpm --filter @dennation/studio typecheck   # Type-check without emit
```

### Architecture

```
packages/studio/
  package.json
  tsconfig.json
  tsup.config.ts
  src/
    types.ts                  — All shared types (DefineResult, StoryExport, PropInfo, etc.)
    api/
      index.ts                — Public package exports (define, types)
      define.ts               — define() → DefineResult with story() and valuesOf() methods
    runtime/
      index.ts                — resolveStories() — resolves valuesOf markers into variants
    parser/
      type-parser.ts          — Converts LSP hover strings → PropInfo[] via oxc
    lsp/
      client.ts               — Minimal JSON-RPC LSP client for tsgo (stdio)
    plugin/
      vite.ts                 — Vite plugin: LSP, file watcher, .gen generation, /__studio route
      scanner.ts              — Glob scanner for .stories.tsx files + analysis
      generator.ts            — Generates studio.gen.ts content
    react/
      Studio.tsx              — <Studio /> component (sidebar, theme, story renderer)
      ShadowRoot.tsx          — Shadow DOM wrapper for CSS isolation
      ErrorBoundary.tsx       — Error boundary for component crash isolation
      styles.ts               — CSS-in-JS styles for Studio UI
      index.ts                — React exports
    cli/
      index.ts                — CLI entry: `npx @dennation/studio generate`
```

### Five build entry points

- **`api/index`** — Library exports (`define`, types). Consumed by user code in `.stories.tsx` files.
- **`runtime/index`** — `resolveStories()` function. Used by generated `studio.gen.ts`.
- **`react/index`** — `<Studio />` component, `ShadowRoot`, `ErrorBoundary`.
- **`plugin/vite`** — Vite plugin (`studioPlugin()`). Handles type extraction and .gen file generation.
- **`cli/index`** — Node CLI binary. One-shot `studio.gen.ts` generation.

### Package exports

- `@dennation/studio` — define, types
- `@dennation/studio/runtime` — resolveStories
- `@dennation/studio/react` — Studio component
- `@dennation/studio/vite` — studioPlugin

### Data flow

```
.stories.tsx  →  plugin scans files  →  analyzeStoryFile()
                                              ↓
                                    tsgo LSP hover  →  type string
                                              ↓
                                    oxc parse  →  PropInfo[]
                                              ↓
                                    generateStudioGenFile()  →  studio.gen.ts
                                              ↓
                                    resolveStories()  →  ResolvedComponent[]
                                              ↓
                                    <Studio registry={registry} />
```

### Key design decisions

- **Vite plugin** — integrates into the user's existing Vite setup. No separate dev server. Scans `.stories.tsx` files, extracts types via tsgo LSP, generates `studio.gen.ts`, watches for changes, and serves `/__studio` route.
- **Type extraction via LSP hover** — spawns `tsgo` as a child process and uses hover requests to get component prop types as strings. These strings are parsed by oxc into structured `PropInfo[]`.
- **Generated .gen file** — single `studio.gen.ts` (TanStack Router pattern) aggregates all stories with resolved type data. `resolveStories()` replaces `valuesOf` markers with actual variant values from extracted types.
- **Shadow DOM isolation** — Studio UI (sidebar, controls) renders inside Shadow DOM so user's global CSS doesn't affect it. Components render in normal DOM so user CSS applies correctly.
- **Error Boundary** — React error boundaries replace iframes for component crash isolation.
- **`valuesOf()` marker pattern** — `button.valuesOf('size')` returns a typed marker `{ __type: 'valuesOf', prop: 'size' }` that gets resolved at runtime by `resolveStories()` using LSP-extracted type data.

---

## packages/playground

Vite + React app for testing studio locally. Uses `@dennation/studio` as a workspace dependency.

### Commands

```bash
pnpm --filter @dennation/playground dev       # Start Vite dev server
pnpm --filter @dennation/playground build     # Type-check + production build
pnpm --filter @dennation/playground preview   # Preview production build
```

### Structure

```
packages/playground/
  package.json
  tsconfig.json
  vite.config.ts                — Vite config with studioPlugin()
  index.html
  src/
    main.tsx                    — Vite entry point
    App.tsx                     — Demo app rendering test components
    components/
      types.ts                  — Shared types (Size, Variant, BaseProps, InteractiveProps)
      Button.tsx                — Button with inline props
      Button.stories.tsx        — Studio stories for Button
      ComposedButton.tsx        — Button with composed interfaces
      ComposedButton.stories.tsx — Studio stories for ComposedButton
      InlineButton.tsx          — Button with intersection type props
```

---

## User-facing API

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { studioPlugin } from '@dennation/studio/vite'

export default defineConfig({
  plugins: [
    react(),
    studioPlugin({ include: './src/components/**/*.stories.tsx' }),
  ],
})
```

### Component.stories.tsx

```ts
import { define } from '@dennation/studio'
import { Button } from './Button'

const button = define(Button, {
  group: 'Forms',
  defaults: { children: 'Click me', onClick: () => {} },
})

export const Sizes = button.story({ variants: button.valuesOf('size') })
export const Variants = button.story({ variants: button.valuesOf('variant') })
export const WithIcon = button.story({ props: { children: '+ Add', size: 'sm' as const } })

export default button
```
