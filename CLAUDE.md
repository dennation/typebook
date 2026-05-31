# @dennation/typebook — monorepo

pnpm workspace monorepo.

## Commands (root)

```bash
pnpm install         # Install all workspace dependencies
pnpm run build       # Build all packages (typebook first, then examples)
pnpm run dev         # Dev mode for all packages in parallel
pnpm run typecheck   # Type-check all packages
```

## Workspace structure

```
packages/
  typebook/             — @dennation/typebook (library + Vite plugin)
examples/
  tanstack-router/      — @dennation/example-tanstack-router
  tanstack-router-mdx/  — @dennation/example-tanstack-router-mdx
```

---

## packages/typebook

React component documentation library. Scans source files for `register()` calls, extracts prop types via the TypeScript Compiler API, and generates `ui-registry.gen.ts`. Consumers embed `<Story>`, `<VariantsStory>`, `<MatrixStory>`, `<Playground>` on any page to render component variants.

### Commands

```bash
pnpm --filter @dennation/typebook build       # Build with Vite (4 entry points)
pnpm --filter @dennation/typebook dev         # Build in watch mode
pnpm --filter @dennation/typebook typecheck   # Type-check without emit
pnpm --filter @dennation/typebook test        # Run vitest
```

### Architecture

```
packages/typebook/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts                  — Public package exports (registerComponent, variants, types)
    types.ts                  — Shared types (TypebookConfig, ComponentHandle, PropInfo, ComponentMeta, UIRegistry, SnippetMap, …)
    registerComponent.ts      — registerComponent(id, Component, config?) → ComponentHandle
    variants.ts               — allOf(of, prop), values(of, prop, vs), generate(of, prop, fn, n)
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into arrays
    constants.ts              — PACKAGE_NAME, DEFAULT_REGISTRY_FILE, DEFAULT_SNIPPETS_FILE, …
    cli.ts                    — CLI entry: `npx @dennation/typebook generate`
    core/                     — Single-pass build pipeline feeding two generators
      builder.ts              — TypebookBuilder: reads + oxc-parses each file ONCE, then runs both
                                scanners on the one AST → type extraction → writes both .gen files + Vite watcher
      registry-scanner.ts     — oxc AST: scanRegistrations(program) finds registerComponent('id', Component) calls
      registry-generator.ts   — generateRegistryFile(): builds ui-registry.gen.ts content
      snippet-scanner.ts      — oxc AST: scanSnippets(program, src) finds <Snippet name="…"> + slices their source
      snippet-generator.ts    — generateSnippetsFile(): builds snippets.gen.ts content
      ts-client.ts            — TypeScript Compiler API: extracts PropInfo[], defaultValues, JSDoc descriptions
      ast.ts                  — Shared oxc-parser helpers (parseProgram → Program, walk) used by both scanners
      source-files.ts         — getSourceFilesFromTsConfig(): the files the builder scans
      io.ts                   — File I/O helpers (writeIfChanged)
    plugins/                  — unplugin-based bundler integration
      factory.ts              — unpluginFactory + createUnplugin (shared across all bundlers)
      vite.ts                 — typebook() Vite plugin
      rollup.ts               — typebook() Rollup plugin
      rolldown.ts             — typebook() Rolldown plugin
      webpack.ts              — typebook() webpack plugin
      rspack.ts               — typebook() Rspack plugin
      esbuild.ts              — typebook() esbuild plugin
      farm.ts                 — typebook() Farm plugin
    react/                          — Runtime, organized by Feature-Sliced Design
      index.ts                      — Public exports
      app/                          — Root provider composing the entities below
        ui/TypebookProvider.tsx     — <TypebookProvider registry={…} snippets={…}>
      widgets/                      — Large public blocks
        Layout/                     — <Layout sidebar={…}>{children}</Layout>
        Story/                      — <Story of={reg} props={…} /> — single variant
        Variants/                   — <Variants of={reg} items={…} /> — prop axis grid
        Matrix/                     — <Matrix of={reg} x={…} y={[…]} /> — cross-product table
          ui/MatrixTable.tsx        — Table layout
          lib/buildMatrixRows.ts    — Pure builder (testable without React)
        Playground/                 — <Playground of={reg} /> — interactive props editor
          ui/PropsTable.tsx         — Search + filter + rows
          ui/PropRow.tsx            — Single prop row
          lib/formatPropType.ts     — Type formatter / controllability check
        Snippet/                    — <Snippet name="…">{children}</Snippet> — live render + "show source" toggle
          ui/Snippet.tsx            — Renders children; toggle reveals source read from context (no fetch)
      features/                     — Interactive units
        prop-input/                 — <PropInput> per-prop controls (literal/bool/string/number)
        code-block/                 — <CodeBlock code={…}/> — Shiki-highlighted with copy
          lib/highlighter.ts        — Shiki singleton
      entities/                     — Domain entities
        component-meta/             — Registry lookup
          model/context.ts          — Registry React Context
          model/useComponentMeta.ts — (id) → ComponentMeta | undefined
        snippets/                   — Snippet source lookup
          model/context.ts          — Snippet React Context + useSnippet(name)
        theme/                      — Light/dark theme with localStorage + system preference
      shared/                       — Reusable primitives
        ui/Preview/                 — <Preview>, <PreviewFrame>, <Isolate>, <ErrorBoundary>
        lib/getGridStyle.ts         — CSS grid layout for variant grids
        config/styles.css           — Typebook UI styles (Tailwind)
        config/cssConstants.ts      — CSS constants (CENTERED_CONTENT_STYLE, IFRAME_STYLE)
```

### Build entry points

- **`index`** — `register`, `allOf`, `values`, `generate`, `defineMenu`, types.
- **`react/index`** — `TypebookProvider`, `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `CodeBlock`, `ErrorBoundary`, `useComponentMeta`.
- **`tanstack-router/index`** — `menuFromRouteTree()` adapter (builds a `Menu` from a TanStack route tree).
- **`plugins/vite`** (and `plugins/{rollup,rolldown,webpack,rspack,esbuild,farm}`) — `typebook()` plugin for each bundler, built from one shared `unpluginFactory`.
- **`cli/index`** — `npx @dennation/typebook generate`.

### Package exports

- `@dennation/typebook` — `register`, `allOf`, `values`, `generate`, `defineMenu`, types (`TypebookConfig`, `UIRegistry`, `SnippetMap`, `ComponentMeta`, `Registration`, `RegisterConfig`, `PropInfo`, `PropType`, `MissingProps`, `PropsOf`, `CoveredOf`, `Menu`, `MenuItem`, `MenuInput`, `MenuItemInput`, `MenuMatch`, `MenuSlot`, `MenuItemState`, …)
- `@dennation/typebook/react` — `TypebookProvider`, `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `CodeBlock`, `ErrorBoundary`, `useComponentMeta`
- `@dennation/typebook/tanstack-router` — `menuFromRouteTree()`, `TypebookRouteMeta` (optional peer: `@tanstack/react-router`)
- `@dennation/typebook/vite` — `typebook()` Vite plugin (also default export). Same `typebook()` factory is published from `/rollup`, `/rolldown`, `/webpack`, `/rspack`, `/esbuild`, `/farm` via [unplugin](https://unplugin.unjs.io)

### register() API

```ts
import { allOf, register } from '@dennation/typebook'
import { Matrix, Story, Variants } from '@dennation/typebook/react'
import { Button } from '../components/Button'

const button = register('button', Button, {
  defaultProps: { children: 'Click me' },
})

<Story of={button} />
<Variants of={button} items={allOf(button, 'size')} />
<Matrix of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
```

- First argument is a **unique string id** — the key in the generated `uiRegistry` object.
- `register()` calls can live anywhere in `./src/**/*.{ts,tsx}` — no special filename required.
- Duplicate ids throw `DuplicateRegistrationError` at build time.
- `<Story>` / `<Variants>` / `<Matrix>` are **type-safe**: required props not covered by `defaultProps` must be passed via `props={…}` at the call site (`MissingProps` phantom type).

### Snippet API

```tsx
import { Snippet } from '@dennation/typebook/react'

<Snippet name="button-group">
  <div className="flex gap-2">
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
  </div>
</Snippet>
```

- At build time the plugin parses each source file with **oxc-parser**, finds every `<Snippet>` JSX element (imported from `@dennation/typebook/react`), reads its children's exact source via `code.slice(openingElement.end, closingElement.start)` — 1:1 text, no regeneration artifacts — dedents it, and emits all blocks as a single generated map file `snippets.gen.ts` (`name → code`, `as const satisfies SnippetMap`). Same physical-file philosophy as `ui-registry.gen.ts`.
- `name` is a **required, author-chosen string** (not `key` — reserved by React; not `codeId` — by request). It must be unique across the project. Duplicate names throw `DuplicateSnippetError`; only a *static* string `name` is extractable.
- The consumer imports `{ snippets }` from `./snippets.gen` and passes it to `TypebookProvider`. At runtime `<Snippet>` renders its children live; the "show source" toggle reads the source **synchronously from React context** (`useSnippet(name)`) — no runtime fetch, no URL/base-path concerns — and renders it through `<CodeBlock>` (Shiki).
- Extraction runs in the universal unplugin `buildStart`, so it works in every bundler; the Vite dev server additionally watches for incremental, debounced re-extraction. Output file is configurable via `snippetsFile` in `TypebookConfig` (default `./src/snippets.gen.ts`); it's only created once a project actually uses `<Snippet>`.

### Menu API

A `Menu` is a router-agnostic navigation tree (the data behind a sidebar/navbar). It is **authored or adapter-generated, never codegen'd** — there is no `<Menu>.gen` file and the builder pipeline is not involved.

```tsx
import { defineMenu } from '@dennation/typebook'
import { menuFromRouteTree } from '@dennation/typebook/tanstack-router'
import { routeTree } from './route-tree.gen'

const menu = defineMenu([
  ...menuFromRouteTree(routeTree, { omit: ['/about'] }),
  // add a custom child into a generated section — `parent` is type-checked against the routes:
  { title: 'Changelog', href: '/changelog', parent: '/components' },
  { href: '/button', title: 'Button', icon: <Cube /> }, // overrides the generated /button in place
  { title: 'GitHub', href: 'https://github.com/dennation/ui-studio' },
])
```

- **Flat input, nested output.** The *input* (`MenuItemInput`) is a **flat** list where hierarchy is expressed by `parent` (the `href` or `id` of the parent), not by nesting. This is what makes adding a custom child to an adapter-generated section trivial — you just point `parent` at it (full-replacement dedup can't append into a nested `items`, so we avoid input nesting entirely). `defineMenu` resolves `parent` into the nested *output* (`MenuItem`, the renderer's model: a node with `items` is a collapsible section, one with `href` is a link, both → clickable section).
- **`parent` is type-checked** to only accept keys (`href`/`id`) that exist in the same list — including route paths flowing in from the adapter *through the spread*. This relies on a phantom `MenuPathBrand<RoutePaths>` on the adapter's return (TS can't recover literal `href`s from a spread array, but a type parameter on the element type survives). `defineMenu`'s generic infers the key union; it degrades to `string` for dynamically-typed `MenuItemInput[]`.
- **No "group"/"separator" node type.** Custom JSX goes in the `before`/`after` render slots (`(item, { active, open }) => ReactNode`). `match` (`'exact'` | `'prefix'` | `RegExp` | predicate) controls active-state highlighting.
- **`defineMenu(input)`** resolves `parent` into the tree, sorts siblings by `order` (then insertion order; `order` stripped), **de-duplicates by `href`/`id`** (the *last* occurrence fully replaces the earlier one, kept at the *first* occurrence's position — this powers spread-then-override), hoists unknown-parent items to the top level (dev warning), and returns a plain `Menu`.
- **`menuFromRouteTree(routeTree, options?)`** walks a TanStack route tree into a flat `MenuItemInput[]` (branded with the path union): root and pathless/layout routes are transparent (children attach to the nearest navigable ancestor), a route with a `path` becomes an item (`href = fullPath`, `parent` = ancestor), and routes in `omit` (typed via `RoutePaths`) or flagged `hidden` are dropped with their subtree. Per-route metadata (`title`/`order`/`icon`/`hidden`) is read by `getMeta` (default: `route.options.staticData?.typebook?.meta`, typed via `TypebookRouteMeta`). Title falls back to a title-cased last path segment.
- **Router stays the consumer's responsibility.** The adapter only *reads* a route tree; rendering a `Menu` is a separate concern (a `Link` and the active path are injected at the render layer).

### Data flow

```
vite.config.ts: typebook()
  └── TypebookBuilder  (reads + oxc-parses each file once, feeds both scanners)
        ├── scanRegistrations: finds registerComponent('id', Component, …)
        │     └── extracts PropInfo[] via TypeScript Compiler API (defaultValues + JSDoc)
        │           └── writes ui-registry.gen.ts
        └── scanSnippets: finds <Snippet name="…"> + slices source
              └── writes snippets.gen.ts

App.tsx:
  import { uiRegistry } from './ui-registry.gen'
  <TypebookProvider registry={uiRegistry}>     ← puts uiRegistry into React Context
    <RouterProvider router={router} />         ← TanStack Router (consumer's responsibility)
  </TypebookProvider>
        ↓
  __root.tsx → Layout → <Outlet /> → page component
        ↓
  <Story of={button} />
    └── useComponentMeta(button.id) → looks up uiRegistry[button.id] → ComponentMeta
```

### Key design decisions

- **Router is consumer's responsibility** — `TypebookProvider` is a pure context provider. Routing, history strategy, and route tree generation belong in the consumer's `vite.config.ts` and `App.tsx`. This removes the TanStack Router hard dependency from the library.
- **String id as registry key** — `register('button', Button)` gives a stable, human-readable key. `uiRegistry` is a plain `Record<string, ComponentMeta>` (`as const satisfies UIRegistry`), so `uiRegistry["button"]` gives the precise inferred type.
- **Generated file is physical** — `ui-registry.gen.ts` is a real file on disk: `tsc --noEmit` needs it, PR diffs show what changed, clone-and-build works without Vite.
- **Type extraction via TS Compiler API** — `ts-client.ts` resolves prop types as strings via `ts.TypeChecker`, extracts default values from destructuring patterns, and reads JSDoc via `symbol.getDocumentationComment()`.
- **`as const satisfies UIRegistry`** — preserves literal types on all registry values so lookup by key returns a precise type, not just `ComponentMeta`.

---

## examples/tanstack-router

Minimal setup: TanStack Router (file-based routing) + `typebook()` plugin, no MDX.

### Commands

```bash
pnpm --filter @dennation/example-tanstack-router dev
pnpm --filter @dennation/example-tanstack-router build
pnpm --filter @dennation/example-tanstack-router typecheck
```

### Structure

```
examples/tanstack-router/
  vite.config.ts          — tanstackRouter() + typebook() + react()
  src/
    main.tsx
    App.tsx               — TypebookProvider + RouterProvider
    ui-registry.gen.ts    — Auto-generated by typebook()
    route-tree.gen.ts     — Auto-generated by @tanstack/router-plugin
    pages/
      __root.tsx          — TypebookLayout + sidebar nav + <Outlet />
      index.tsx
      about.tsx
      button.tsx          — register('button', Button, …) + Story/VariantsStory/MatrixStory
    components/
      Button.tsx
```

---

## examples/tanstack-router-mdx

Same as `tanstack-router` with MDX pages. MDX via `@mdx-js/rollup` (user-installed).

### Commands

```bash
pnpm --filter @dennation/example-tanstack-router-mdx dev
pnpm --filter @dennation/example-tanstack-router-mdx build
pnpm --filter @dennation/example-tanstack-router-mdx typecheck
```

---

## User-facing API

### Bundler plugin (unplugin)

The plugin is built on [unplugin](https://unplugin.unjs.io), so the **same**
`typebook(config?)` factory is published per bundler — no bundler is privileged.
The registry is generated during the universal `buildStart` hook (idempotent,
re-runs on each rebuild). The Vite entry additionally wires the dev-server
watcher for incremental, debounced regeneration (Vite's dev server doesn't
re-run `buildStart` per change); every other bundler relies on the `buildStart`
rebuild.

```ts
// vite      → @dennation/typebook/vite
// rollup    → @dennation/typebook/rollup
// rolldown  → @dennation/typebook/rolldown
// webpack   → @dennation/typebook/webpack
// rspack    → @dennation/typebook/rspack
// esbuild   → @dennation/typebook/esbuild
// farm      → @dennation/typebook/farm
```

Each entry exports the plugin both as the named `typebook` and as `default`, so
either import style works:

```ts
import { typebook } from '@dennation/typebook/rspack'
import typebook from '@dennation/typebook/rspack'
```

```ts
// rspack.config.js
const { typebook } = require('@dennation/typebook/rspack')
module.exports = { plugins: [typebook({ /* TypebookConfig */ })] }
```

The repo's examples happen to use Vite, so a full Vite config looks like:

```ts
import { typebook } from '@dennation/typebook/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/pages',
      generatedRouteTree: './src/route-tree.gen.ts',
      autoCodeSplitting: true,
    }),
    typebook({
      // registryFile: './src/ui-registry.gen.ts', // default
    }),
    react(),
  ],
})
```

For MDX, add `@mdx-js/rollup` first:

```ts
import mdx from '@mdx-js/rollup'
plugins: [tanstackRouter(…), mdx(), typebook(), react()]
```

### src/App.tsx

```tsx
import { TypebookProvider } from '@dennation/typebook/react'
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen'
import { snippets } from './snippets.gen'
import { uiRegistry } from './ui-registry.gen'

const router = createRouter({ routeTree, history: createHashHistory(), defaultPreload: 'intent' })

export default function App() {
  return (
    <TypebookProvider registry={uiRegistry} snippets={snippets}>
      <RouterProvider router={router} />
    </TypebookProvider>
  )
}
```

> `snippets` is optional — omit it (and the import) if the project doesn't use `<Snippet>`.

### src/pages/__root.tsx

```tsx
import { TypebookLayout } from '@dennation/typebook/react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({ component: RootComponent })

function RootComponent() {
  return (
    <TypebookLayout sidebar={<nav><Link to="/">Home</Link></nav>}>
      <Outlet />
    </TypebookLayout>
  )
}
```

### src/pages/button.tsx

```tsx
import { allOf, register } from '@dennation/typebook'
import { MatrixStory, Story, VariantsStory } from '@dennation/typebook/react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/Button'

const button = register('button', Button, { defaultProps: { children: 'Click me' } })

export const Route = createFileRoute('/button')({ component: ButtonPage })

function ButtonPage() {
  return (
    <>
      <Story of={button} />
      <VariantsStory of={button} items={allOf(button, 'size')} />
      <MatrixStory of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
    </>
  )
}
```
