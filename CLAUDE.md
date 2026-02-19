# @dennation/ui-studio — monorepo

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
  studio/      — @dennation/ui-studio (library + Vite plugin)
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
pnpm --filter @dennation/ui-studio build       # Build with Vite (3 entry points)
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
    index.ts                  — Public package exports (define, resolveStories, types)
    types.ts                  — All shared types (DefineResult, Story, PropInfo, ResolvedComponent, etc.)
    define.ts                 — define() → DefineResult with single(), variants(), matrix(), allOf(), values(), generate()
    resolve.ts                — resolveStories() — resolves VariantConfig markers into variants
    constants.ts              — Shared constants (PACKAGE_NAME, etc.)
    cli.ts                    — CLI entry: `npx @dennation/ui-studio generate`
    core/
      scanner.ts              — Glob scanner for .stories.tsx files + analysis
      generator.ts            — Generates ui-studio.gen.ts content
      ts-client.ts            — TypeScript Compiler API client for type extraction
      type-parser.ts          — Converts TS type strings → PropInfo[] via oxc
    plugins/
      vite/
        index.ts              — Vite plugin: type extraction, file watcher, .gen generation, /__studio route
    react/
      index.ts                — React exports
      components/
        index.ts              — Barrel export
        Studio.tsx            — <Studio /> component (sidebar, theme, story renderer)
        StoryRenderer.tsx     — Renders single/variants/matrix stories
        ComponentPreview.tsx   — Component preview with interactive props panel
        PropControl.tsx       — Prop controls: dropdown (literal), toggle (boolean), input (string), number
        VariantCard.tsx       — Single variant preview card (with iframe isolation)
        IframePreview.tsx     — Iframe wrapper for CSS isolation of component previews
        ErrorBoundary.tsx     — Error boundary for component crash isolation
      utils/
        index.ts              — Barrel export
        groupComponents.ts    — Groups components by group field
        getLayoutStyle.ts     — Computes CSS grid layout for variant grids
      styles/
        styles.css            — Studio UI styles (Tailwind)
```

### Build entry points

- **`index`** — Library exports (`define`, `resolveStories`, types). Consumed by user code and generated `.gen.ts`.
- **`react/index`** — `<Studio />` component, `ErrorBoundary`.
- **`plugins/vite`** — Vite plugin (`uiStudio()`). Handles type extraction and .gen file generation.

### Package exports

- `@dennation/ui-studio` — define, resolveStories, types
- `@dennation/ui-studio/react` — Studio component
- `@dennation/ui-studio/vite` — uiStudio vite plugin

### Data flow

```
.stories.tsx  →  plugin scans files  →  analyzeStoryFile()
                                              ↓
                                    TypeScript Compiler API  →  type string
                                              ↓
                                    oxc parse  →  PropInfo[]
                                              ↓
                                    generateStudioGenFile()  →  ui-studio.gen.ts
                                              ↓
                                    resolveStories()  →  ResolvedComponent[]
                                              ↓
                                    <Studio registry={registry} />
```

### Key design decisions

- **Vite plugin** — integrates into the user's existing Vite setup. No separate dev server. Scans `.stories.tsx` files, extracts types via TypeScript Compiler API, generates `ui-studio.gen.ts`, watches for changes, and serves `/__studio` route.
- **Type extraction via TS Compiler API** — uses TypeScript Compiler API directly (`ts-client.ts`) to get component prop types as strings. These strings are parsed by oxc into structured `PropInfo[]`.
- **Generated .gen file** — single `ui-studio.gen.ts` (TanStack Router pattern) aggregates all stories with resolved type data. `resolveStories()` replaces `VariantConfig` markers with actual variant values from extracted types.
- **Iframe isolation** — each variant card renders inside an iframe (`IframePreview`) so component styles don't bleed into Studio UI and vice versa.
- **Error Boundary** — React error boundaries isolate component crashes per variant.
- **VariantConfig marker pattern** — `button.allOf('size')` returns a typed marker `{ __type: 'allOf', prop: 'size' }` that gets resolved at runtime by `resolveStories()` using TS-extracted type data.
- **Three story kinds** — `single` (one card), `variants` (grid of values for one prop), `matrix` (table: x prop × y props).

---

## packages/playground

Vite + React app for testing studio locally. Uses `@dennation/ui-studio` as a workspace dependency. Components come from `@heroui/*` external library.

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
    uiStudio({ include: './src/**/*.stories.tsx' }),
  ],
})
```

### Component.stories.tsx

```ts
import { define } from '@dennation/ui-studio'
import { Button } from '@heroui/button'

const button = define(Button, {
  group: 'Forms',
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

// Matrix story — cross-product table (x columns × y rows)
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant')],
})

export default button
```

### Variant config helpers

- `button.allOf('size')` — auto-generate all values from TypeScript prop type
- `button.values('size', ['sm', 'md', 'lg'])` — manual list of values
- `button.generate('size', () => randomValue(), 5)` — generate N values via function
