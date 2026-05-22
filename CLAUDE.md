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
    index.ts                  — Public package exports (register, variants, types)
    types.ts                  — Shared types (TypebookConfig, Registration, PropInfo, ComponentMeta, UIRegistry, …)
    register.ts               — register(id, Component, config?) → Registration
    variants.ts               — allOf(of, prop), values(of, prop, vs), generate(of, prop, fn, n)
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into arrays
    constants.ts              — PACKAGE_NAME, DEFAULT_REGISTRY_FILE, DEFAULT_SOURCE_GLOB, …
    cli.ts                    — CLI entry: `npx @dennation/typebook generate`
    core/
      registry.ts             — RegistryBuilder: orchestrates scan → type extraction → file write + Vite watcher
      scanner.ts              — Glob scanner + oxc AST: finds register('id', Component) calls
      ts-client.ts            — TypeScript Compiler API: extracts PropInfo[], defaultValues, JSDoc descriptions
      generator.ts            — Generates ui-registry.gen.ts content
      io.ts                   — File I/O helpers
    plugins/
      vite/
        index.ts              — typebook(config?) Vite plugin
    react/
      index.ts                — React public exports
      context.ts              — TypebookMetaContext / TypebookMetaProvider / useTypebookMeta
      components/
        RegistryProvider.tsx  — <RegistryProvider uiRegistry={uiRegistry}>{children}</RegistryProvider>
        TypebookLayout.tsx    — <TypebookLayout sidebar={…}>{children}</TypebookLayout>
        Story.tsx             — <Story of={reg} props={…} /> — single variant
        VariantsStory.tsx     — <VariantsStory of={reg} items={…} /> — prop axis grid
        MatrixStory.tsx       — <MatrixStory of={reg} x={…} y={[…]} /> — cross-product table
        Playground.tsx        — <Playground of={reg} /> — interactive props editor
        ComponentPreview.tsx  — Shared render: ErrorBoundary + IframePreview wrapper
        CodePreview.tsx       — Shiki-highlighted code block with copy button
        PropControl.tsx       — Per-prop controls: dropdown (literal), toggle (bool), input (string/number)
        PreviewCard.tsx       — Single variant card (ComponentPreview + label)
        IframePreview.tsx     — Iframe wrapper for CSS isolation
        ErrorBoundary.tsx     — Crash isolation for component previews
      hooks/
        useRegistration.ts    — (Registration) → { Component, propInfos, defaultProps, meta }
        useTheme.ts           — light/dark theme with localStorage + system preference
      utils/
        getGridStyle.ts       — CSS grid layout for variant grids
      styles/
        styles.css            — Typebook UI styles (Tailwind)
        constants.ts          — CSS constants
```

### Build entry points

- **`index`** — `register`, `allOf`, `values`, `generate`, types.
- **`react/index`** — `RegistryProvider`, `TypebookLayout`, `Story`, `VariantsStory`, `MatrixStory`, `Playground`, `CodePreview`, `ErrorBoundary`.
- **`plugins/vite`** — `typebook()` Vite plugin.
- **`cli/index`** — `npx @dennation/typebook generate`.

### Package exports

- `@dennation/typebook` — `register`, `allOf`, `values`, `generate`, types (`TypebookConfig`, `UIRegistry`, `ComponentMeta`, `Registration`, `RegisterConfig`, `PropInfo`, `PropType`, `MissingProps`, `PropsOf`, `CoveredOf`, …)
- `@dennation/typebook/react` — `RegistryProvider`, `TypebookLayout`, `Story`, `VariantsStory`, `MatrixStory`, `Playground`, `CodePreview`, `ErrorBoundary`
- `@dennation/typebook/vite` — `typebook()` Vite plugin

### register() API

```ts
import { allOf, register } from '@dennation/typebook'
import { MatrixStory, Story, VariantsStory } from '@dennation/typebook/react'
import { Button } from '../components/Button'

const button = register('button', Button, {
  defaultProps: { children: 'Click me' },
})

<Story of={button} />
<VariantsStory of={button} items={allOf(button, 'size')} />
<MatrixStory of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
```

- First argument is a **unique string id** — the key in the generated `uiRegistry` object.
- `register()` calls can live anywhere in `./src/**/*.{ts,tsx}` — no special filename required.
- Duplicate ids throw `DuplicateRegistrationError` at build time.
- `<Story>` / `<VariantsStory>` / `<MatrixStory>` are **type-safe**: required props not covered by `defaultProps` must be passed via `props={…}` at the call site (`MissingProps` phantom type).

### Data flow

```
vite.config.ts: typebook()
  └── RegistryBuilder
        ├── scans ./src/**/*.{ts,tsx} for register('id', Component, …)
        ├── extracts PropInfo[] via TypeScript Compiler API (defaultValues + JSDoc)
        └── writes ui-registry.gen.ts

App.tsx:
  import { uiRegistry } from './ui-registry.gen'
  <RegistryProvider uiRegistry={uiRegistry}>   ← puts uiRegistry into TypebookMetaContext
    <RouterProvider router={router} />          ← TanStack Router (consumer's responsibility)
  </RegistryProvider>
        ↓
  __root.tsx → TypebookLayout → <Outlet /> → page component
        ↓
  <Story of={button} />
    └── useRegistration(button) → looks up uiRegistry[button.id] → ComponentMeta
```

### Key design decisions

- **Router is consumer's responsibility** — `RegistryProvider` is a pure context provider. Routing, history strategy, and route tree generation belong in the consumer's `vite.config.ts` and `App.tsx`. This removes the TanStack Router hard dependency from the library.
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
    App.tsx               — RegistryProvider + RouterProvider
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

### vite.config.ts

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
      // sourceGlob: './src/**/*.{ts,tsx}',        // default
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
import { RegistryProvider } from '@dennation/typebook/react'
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen'
import { uiRegistry } from './ui-registry.gen'

const router = createRouter({ routeTree, history: createHashHistory(), defaultPreload: 'intent' })

export default function App() {
  return (
    <RegistryProvider uiRegistry={uiRegistry}>
      <RouterProvider router={router} />
    </RegistryProvider>
  )
}
```

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
