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
- **`.gitignore`** — Ignores `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`.

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
    index.ts                  — Public package exports (define, types)
    types.ts                  — All shared types (DefineResult, Story, PropInfo, ComponentMeta, RegistryEntry, etc.)
    define.ts                 — define() → DefineResult with single(), variants(), matrix(), allOf(), values(), generate()
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into variant arrays (used by renderers)
    constants.ts              — Shared constants (PACKAGE_NAME, etc.)
    cli.ts                    — CLI entry: `npx @dennation/ui-studio generate`
    core/
      scanner.ts              — Glob scanner for .stories.tsx files + oxc AST analysis
      generator.ts            — Generates ui-studio-registry.gen.ts and ui-studio-meta.gen.ts content
      ts-client.ts            — TypeScript Compiler API client for type extraction
      type-parser.ts          — Converts TS type strings → PropInfo[] via oxc
    plugins/
      vite/
        index.ts              — Vite plugin: type extraction, file watcher, two-file gen generation
    react/
      index.ts                — React exports
      components/
        index.ts              — Barrel export
        Studio.tsx            — <Studio /> component (sidebar, theme, story dispatch)
        StoryRenderer.tsx     — Dispatches to RenderSingle / RenderVariants / RenderMatrix
        ComponentPreview.tsx   — Component preview with interactive props panel
        PropControl.tsx       — Prop controls: dropdown (literal), toggle (boolean), input (string), number
        VariantCard.tsx       — Single variant preview card (inline by default, iframe when isolate: true)
        IframePreview.tsx     — Iframe wrapper for CSS isolation of component previews
        ErrorBoundary.tsx     — Error boundary for component crash isolation
      utils/
        index.ts              — Barrel export
        groupComponents.ts    — Groups RegistryEntry[] by config.group field
        getLayoutStyle.ts     — getGridStyle() — computes CSS grid layout for variant grids
      styles/
        styles.css            — Studio UI styles (Tailwind)
```

### Build entry points

- **`index`** — Library exports (`define`, types). Consumed by user code and generated `.gen.ts`.
- **`react/index`** — `<Studio />` component, `ErrorBoundary`.
- **`plugins/vite`** — Vite plugin (`uiStudio()`). Handles type extraction and two-file gen generation.

### Package exports

- `@dennation/ui-studio` — define, types (ComponentMeta, RegistryEntry, etc.)
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
                                    generateMetaFile()       →  ui-studio-meta.gen.ts (extracted types)
                                    generateRegistryFile()   →  ui-studio-registry.gen.ts (imports + assembly)
                                              ↓
                                    <Studio />  passes RegistryEntry[] to renderers
                                              ↓
                                    RenderSingle / RenderVariants / RenderMatrix
                                    resolve variants lazily via resolveVariantConfig()
```

### Key design decisions

- **Vite plugin** — integrates into the user's existing Vite setup. No separate dev server. Scans `.stories.tsx` files, extracts types via TypeScript Compiler API, generates two gen files, watches for changes.
- **Type extraction via TS Compiler API** — uses TypeScript Compiler API directly (`ts-client.ts`) to get component prop types as strings. These strings are parsed by oxc into structured `PropInfo[]`.
- **Two generated files on disk (not virtual modules)** — `ui-studio-registry.gen.ts` (imports stories/configs, assembles registry array) and `ui-studio-meta.gen.ts` (extracted component metadata keyed by file path). Registry imports meta internally — user only imports registry. Both paths are independently configurable via `output` and `metaOutput`. Files are **physical and committed to git** — not Vite virtual modules. Reasons: (1) `tsc --noEmit` runs before Vite in build scripts, so it needs real files to typecheck against — virtual modules are invisible to `tsc`; (2) gen files are the primary debugging tool for type extraction — when props don't appear, you open `ui-studio-meta.gen.ts` and immediately see what was extracted; (3) PR diffs show exactly what changed in extracted types; (4) clone-and-build works without running Vite first. This matches TanStack Router's approach with `routeTree.gen.ts`. HMR works naturally — Vite's file watcher picks up gen file changes after `writeIfChanged()`, and the guard in the plugin prevents infinite regen cycles.
- **Self-contained stories** — each story (single/variants/matrix) carries its own `component` reference and `defaults`, making stories reusable without the DefineResult.
- **Lazy variant resolution** — each story kind renderer (RenderSingle, RenderVariants, RenderMatrix) resolves its own VariantConfig markers inline using `resolveVariantConfig()`. No upfront resolution step — variants are only computed for the story being displayed.
- **Iframe isolation opt-in** — variant cards render inline by default. Add `isolate: true` to a story to render inside an iframe (`IframePreview`) for full CSS/JS isolation. Only needed for components that interact with document/body (modals, dropdowns with portals). Studio's `st:` Tailwind prefix already prevents style bleeding for normal components.
- **Error Boundary** — React error boundaries isolate component crashes per variant.
- **VariantConfig marker pattern** — `button.allOf('size')` returns a typed marker `{ __type: 'allOf', prop: 'size' }` that gets resolved at render time by the story renderer using TS-extracted type data.
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
    uiStudio({
      include: './src/**/*.stories.tsx',
      output: './ui-studio-registry.gen.ts',   // default
      metaOutput: './ui-studio-meta.gen.ts',   // default
    }),
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
