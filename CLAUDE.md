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
  menu/                 — @dennation/menu (router-agnostic navigation menu)
examples/
  tanstack-router/      — @dennation/example-tanstack-router
  tanstack-router-mdx/  — @dennation/example-tanstack-router-mdx
apps/
  website/              — @dennation/website (marketing landing site)
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
      snippet-scanner.ts      — oxc AST: scanSnippets(program, src) finds <Snippet name="…">{fn}</Snippet>
                                and slices the inline function's body (non-inline child → null → build error)
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
        docs-sidebar/               — <DocsSidebar sections={…} current onNavigate/> — collapsible docs nav + mobile drawer
        docs-toc/                   — <DocsToc/> "On this page" + useDocHeadings() (collect + scrollspy + jump)
        breadcrumbs/                — <Breadcrumbs items={[…]}/> — chevron trail above a docs title
        prev-next-nav/              — <PrevNextNav prev next onPrev onNext/> — footer page cards
      features/                     — Interactive units
        prop-input/                 — <PropInput> per-prop controls (literal/bool/string/number)
        code-block/                 — <CodeBlock tabs|code file lang showLineNumbers highlightLines/> —
                                      the one code component; lib/tokenize.ts — lazy Shiki singleton with a
                                      css-variables theme mapped to --syn-* tokens (any language, theme-aware colors)
        search-palette/             — <SearchPalette index={…}/> — ⌘K palette + useSearchHotkeys() + SearchEntry
        copy-command/               — <CopyCommand cmd="npx …"/> — copy-able install-command pill
      entities/                     — Domain entities
        component-meta/             — Registry lookup
          model/context.ts          — Registry React Context
          model/useComponentMeta.ts — (id) → ComponentMeta | undefined
        snippets/                   — Snippet source lookup
          model/context.ts          — Snippet React Context + useSnippet(name)
        theme/                      — Light/dark theme with localStorage + system preference
      shared/                       — Reusable primitives
        ui/Preview/                 — <Preview>, <PreviewFrame>, <Isolate>, <ErrorBoundary>
        ui/md/                      — Markdown/MDX content set: Callout, MDTable, PropsTable, Tabs,
                                      Steps, Accordion, Cards/DocCard, H2/H3, P/Lead/C/A/Ul/Ol/Li/Hr/Quote, ImgPlaceholder
        lib/getGridStyle.ts         — CSS grid layout for variant grids
        lib/slugify.ts, childText.ts — heading anchor helpers used by the md set
        config/styles.css           — Typebook UI styles (Tailwind)
        config/cssConstants.ts      — CSS constants (CENTERED_CONTENT_STYLE, IFRAME_STYLE)
```

### Build entry points

- **`index`** — `register`, `allOf`, `values`, `generate`, types.
- **`react/index`** — `TypebookProvider`, `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `ErrorBoundary`, `useComponentMeta` + the docs component kit (md set, `CodeBlock`, `SearchPalette`, `DocsSidebar`, `DocsToc`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`).
- **`plugins/vite`** (and `plugins/{rollup,rolldown,webpack,rspack,esbuild,farm}`) — `typebook()` plugin for each bundler, built from one shared `unpluginFactory`.
- **`cli/index`** — `npx @dennation/typebook generate`.

### Package exports

- `@dennation/typebook` — `register`, `allOf`, `values`, `generate`, types (`TypebookConfig`, `UIRegistry`, `SnippetMap`, `ComponentMeta`, `Registration`, `RegisterConfig`, `PropInfo`, `PropType`, `MissingProps`, `PropsOf`, `CoveredOf`, …)
- `@dennation/typebook/react` — **storybook runtime:** `TypebookProvider`, `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `ErrorBoundary`, `useComponentMeta`. **docs kit** (for consumer documentation sites): md set (`Callout`, `MDTable`, `PropsTable`, `Tabs`, `Steps`/`Step`, `Accordion`, `Cards`/`DocCard`, `H2`/`H3`, `P`/`Lead`/`C`/`A`/`Ul`/`Ol`/`Li`/`Hr`/`Quote`, `ImgPlaceholder`), `CodeBlock` (tabs/filename/line numbers/highlight lines; Shiki with a css-variables theme bound to the design tokens — any language, theme-aware colors, lazy-loaded grammars), `SearchPalette`/`useSearchHotkeys`/`SearchEntry`, `DocsSidebar`/`DocsNavSection`, `DocsToc`/`useDocHeadings`/`DocsHeading`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`, `slugify`/`childText`. **universal primitives:** `Icon`, `Button`/`buttonClass`/`ARROW_CLASS`, `ThemeToggle`, `cx`.
- `@dennation/typebook/vite` — `typebook()` Vite plugin (also default export). Same `typebook()` factory is published from `/rollup`, `/rolldown`, `/webpack`, `/rspack`, `/esbuild`, `/farm` via [unplugin](https://unplugin.unjs.io)

> **What lives where.** The package exports only what is **universal** — the storybook runtime, the docs component kit (md set, CodeBlock, search palette, sidebar/toc/breadcrumbs/prev-next, CopyCommand), generic primitives (`Icon`, `Button`, `ThemeToggle`, `cx`) and the design system. Anything **specific to one site** (marketing landing sections, demo "gifs", section heading, scroll-reveal hook, layout constants, page content and nav data) lives in that app — see `apps/website`, not the package.

> **Design system.** The package ships one OKLCH token system in `src/react/shared/config/theme.css` (`--bg`/`--fg`/`--accent`/… with a `[data-theme="dark"]` block), re-exported into Tailwind utilities via `@theme inline` (`bg-bg`, `text-fg-muted`, `border-border`, `text-accent`, `bg-accent-soft`, `text-tok-*`, …) and including the `.reveal`/`.in` and `.tok-*` helpers + keyframes. The old `st:`-prefixed token set is gone; the storybook UI and any consumer site read these tokens. `shared/config/styles.css` (`@import "tailwindcss"` + theme + `@source`) is injected at runtime by `<Layout>`; a consumer that renders its own page (not via `<Layout>`) supplies the CSS itself by importing the shared `theme.css` and `@source`-scanning its components (see `apps/website`).

> Navigation menus live in a **separate package**, `@dennation/menu` — see its section below. Typebook no longer exports `defineMenu`/`Menu`/`menuFromRouteTree`.

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

// inline arrow (stateless)
<Snippet name="button-group">
  {() => (
    <div className="flex gap-2">
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )}
</Snippet>

// inline named function (hooks) — capitalized so rules-of-hooks recognises a component
<Snippet name="counter">
  {function Counter() {
    const [n, setN] = useState(0)
    return <Button onClick={() => setN(n + 1)}>Count: {n}</Button>
  }}
</Snippet>
```

- **The child is an inline function component, not raw JSX** — `children: () => ReactNode`. At runtime `<Snippet>` renders it as `<Demo/>` (so hooks work); the shown source is the **function body**.
- At build time the plugin parses each source file with **oxc-parser** and finds every `<Snippet>` element (imported from `@dennation/typebook/react`), then slices the inline function's body 1:1 from the file (block body → between the braces; expression body → the expression, parens unwrapped), dedents it, and emits all into a single generated map `snippets.gen.ts` (`name → code`, `as const satisfies SnippetMap`). The child must be an **inline** function literal — a bare reference (`{Component}`) or raw JSX can't be sliced from the call site and raises a build error (`SnippetNotInlineError`). This keeps extraction pure-oxc and same-file: a snippet only changes when its own file does, so no cross-file resolution or watcher dependency graph is needed.
- `name` is a **required, author-chosen string** (not `key` — reserved by React; not `codeId` — by request). It must be unique across the project. Duplicate names throw `DuplicateSnippetError`; only a *static* string `name` is extractable.
- The consumer imports `{ snippets }` from `./snippets.gen` and passes it to `TypebookProvider`. At runtime the "show source" toggle reads the source **synchronously from React context** (`useSnippet(name)`) — no runtime fetch, no URL/base-path concerns — and renders it through `<CodeBlock>`.
- Extraction runs in the universal unplugin `buildStart`, so it works in every bundler; the Vite dev server additionally watches for incremental, debounced re-extraction. Output file is configurable via `snippetsFile` in `TypebookConfig` (default `./src/snippets.gen.ts`); it's only created once a project actually uses `<Snippet>`.

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

## packages/menu

`@dennation/menu` — a standalone, router-agnostic navigation menu (the data behind a sidebar/navbar) plus a React renderer and a TanStack Router adapter. It has **no dependency on typebook** and is **never codegen'd** — a `Menu` is authored or adapter-generated, not produced by a builder pipeline.

### Commands

```bash
pnpm --filter @dennation/menu build       # Build with Vite (3 entry points)
pnpm --filter @dennation/menu dev         # Build in watch mode
pnpm --filter @dennation/menu typecheck   # Type-check without emit
pnpm --filter @dennation/menu test        # Run vitest
```

### Architecture

```
packages/menu/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts                  — `defineMenu` + menu types
    types.ts                  — Menu, MenuItem, MenuInput, MenuItemInput, MenuItemBase, MenuSlot, MenuItemState
    defineMenu.ts             — defineMenu(input) — resolves a keyed MenuInput into a nested Menu
    react/
      index.ts                — re-exports the renderer
      Menu.tsx                — <Menu menu={…} components={{ Container, Item }} /> — router-agnostic renderer
    tanstack-router/
      index.ts                — menuFromRouteTree() adapter + RouteMenuMeta
```

### Build entry points / package exports

- `@dennation/menu` — `defineMenu`, types (`Menu`, `MenuItem`, `MenuInput`, `MenuItemInput`, `MenuItemBase`, `MenuSlot`, `MenuItemState`)
- `@dennation/menu/react` — `Menu`, `MenuProps`, `MenuComponents`, `MenuContainerProps`, `MenuItemProps`, `CollapsibleMenuItemProps`, `StaticMenuItemProps`
- `@dennation/menu/tanstack-router` — `menuFromRouteTree()`, `RouteMenuMeta`, `MenuFromRouteTreeOptions`, `RouteMenuInput` (optional peer: `@tanstack/react-router`)

### Menu API

```tsx
import { defineMenu } from '@dennation/menu'
import { menuFromRouteTree } from '@dennation/menu/tanstack-router'
import { routeTree } from './route-tree.gen'

const menu = defineMenu({
  ...menuFromRouteTree(routeTree, { omit: ['/about'] }),
  // add a custom child into a generated section — `parent` is type-checked against the routes:
  '/changelog': { title: 'Changelog', parent: '/components' },
  '/button': { title: 'Button', icon: <Cube /> }, // overrides the generated /button entry
  'https://github.com/dennation/ui-studio': { title: 'GitHub' },
})
```

- **Keyed input, nested output.** The *input* (`MenuInput`) is an **object keyed by identity** — the entry's `href` by default, or an arbitrary id for a non-navigable container (`href: false`). Hierarchy is expressed by `parent` (another key), not by nesting. `defineMenu` resolves `parent` into the nested *output* (`MenuItem`, the renderer's model: a node with `items` is a collapsible section, one with `href` is a link, both → clickable section).
- **Override and child-injection are native object ops.** Keys are unique, so an override is just re-stating a key on spread (`{ ...generated, '/button': { … } }` — later wins, the key keeps its original position); adding a custom child is one new key pointing `parent` at a generated key. No de-dup pass.
- **`parent` is type-checked** via `keyof` the input — including route paths flowing in from the adapter *through the spread* (object spread preserves keys in the type, unlike an array, so no phantom brand is needed). It degrades to `string` for a dynamically-typed `Record<string, MenuItemInput>`.
- **No "group"/"separator" node type.** Custom JSX goes in the `before`/`after` render slots (`(item, { open, level }) => ReactNode`). Active-state highlighting lives entirely in the consumer's `Item` (the renderer knows nothing about the current path).
- **`defineMenu(input)`** resolves `parent` into the tree, sorts siblings by `order` (then insertion order; `order` stripped), resolves `href` (the key by default) onto each node, hoists unknown-parent items to the top level (dev warning), and returns a plain `Menu`.
- **`menuFromRouteTree(routeTree, options?)`** walks a TanStack route tree into a `MenuInput` keyed by `fullPath`: root and pathless/layout routes are transparent (children attach to the nearest navigable ancestor), a route with a `path` becomes an entry (`parent` = ancestor), and routes in `omit` (typed via `RoutePaths`) are dropped with their subtree. Per-route metadata (`title`/`order`/`icon`) is read by `getMeta` (default: `route.options.staticData?.menu?.meta`, typed via `RouteMenuMeta`) and describes how the route presents itself; composition (exclude/override/order) lives in the authoring layer, not in route metadata. Title falls back to a title-cased last path segment.
- **`<Menu>` is the renderer.** Pass it a `Menu` plus consumer-supplied `Container` and `Item` components. `<Menu>` owns the open/closed state of collapsible sections and the recursion; the `Item` owns the link/icon/active state (it talks to its own router). Router stays the consumer's responsibility — the adapter only *reads* a route tree.

### Per-route metadata augmentation

`@dennation/menu/tanstack-router` augments TanStack's `StaticDataRouteOption` so each route can describe itself:

```tsx
createFileRoute('/button')({
  component: ButtonPage,
  staticData: { menu: { meta: { title: 'Button', order: 2 } } },
})
```

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

## apps/website

`@dennation/website` — the marketing landing + docs site, built from the Typebok design handoff. A Vite + React app with TanStack Router (file-based routes in `src/pages/`, basepath from `import.meta.env.BASE_URL` for GitHub Pages). Site-specific components live **here**; the docs UI itself (md set, CodeBlock, SearchPalette, DocsSidebar/DocsToc, Breadcrumbs, PrevNextNav, CopyCommand) comes from `@dennation/typebook/react`. Organized FSD-style: `pages/`, `entities/`, `shared/`, `widgets/`. Deployed to GitHub Pages by `.github/workflows/deploy-website.yml` (SPA fallback via `404.html`).

### Commands

```bash
pnpm --filter @dennation/website dev
pnpm --filter @dennation/website build
pnpm --filter @dennation/website typecheck
```

### Structure

```
apps/website/
  index.html              — fonts (Geist/Geist Mono/Source Serif 4) + pre-paint theme bootstrap (data-theme on <html>)
  vite.config.ts          — tanstackRouter() + react() + tailwindcss(); base from VITE_BASE (CI sets /typebook/)
  src/
    main.tsx              — mounts <App /> and imports styles.css
    App.tsx               — createRouter(routeTree, basepath) + <RouterProvider/>
    styles.css            — @import "tailwindcss" + the shared theme.css + @source for the app and the typebook react package
    route-tree.gen.ts     — generated by @tanstack/router-plugin (excluded from biome)
    pages/                — file-based routes
      __root.tsx          — RootLayout (shared SiteHeader + ⌘K palette + <Outlet/>)
      index.tsx           — landing
      docs.index.tsx      — redirect → /docs/introduction
      docs.$slug.tsx      — docs page (unknown slugs redirect to introduction)
    entities/docs/nav.ts  — NAV sections, FLAT order, pageMeta(), SEARCH_INDEX (this site's content data)
    shared/
      lib/{useReveal.ts, landingLayout.ts, siteLinks.ts}   — scroll-reveal hook + class constants + GITHUB_URL
      ui/SectionHead.tsx                      — section eyebrow + title + subtitle
    widgets/
      layout/{RootLayout.tsx, ShellContext.ts} — root shell: header, global ⌘K search, docs drawer state
      SiteHeader.tsx                          — unified sticky header (nav, search, theme, CTA)
      Landing.tsx                             — composes the landing (drives useReveal)
      SiteFooter.tsx
      LandingHero.tsx, LandingFeatures.tsx, LandingCompare.tsx, LandingStats.tsx, LandingCta.tsx
      demos/{DemoSearch,DemoTree,DemoTheme,DemoMdx}.tsx + demoClasses.ts   — looping feature "gifs"
      docs/
        DocsPage.tsx                          — docs screen: DocsSidebar + content + DocsToc (package components)
        go.ts                                 — DocsGo navigation type
        pages/                                — page content (Introduction, Installation, Quick Start, Markdown, Callout, GenericPage)
```

- **Styling.** `styles.css` imports the package's single source of truth, `packages/typebook/src/react/shared/config/theme.css`, and `@source`-scans both the app and `packages/typebook/src/react/**/*.tsx` (the latter so the universal primitives' utilities are emitted). Theme switching writes `data-theme` on `<html>` (key `typebook-theme`); a small inline script in `index.html` applies it before paint to avoid a flash.
- **Build order.** The site imports the built `@dennation/typebook` dist, so `pnpm -r run build` builds `typebook` first.

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
