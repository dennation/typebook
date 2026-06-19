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

React component documentation library. In its bundler-plugin `transform` hook it scans each source module for `getComponentMeta()` calls and `<Snippet>` elements, extracts prop types via the TypeScript Compiler API, and **injects** the results back into the same module — `__props` into the `getComponentMeta()` config, `__snippetSource` onto the `<Snippet>` element. No files are generated; the handle returned by `getComponentMeta()` is self-contained. Consumers embed `<Story>`, `<Variants>`, `<Matrix>`, `<Playground>`, `<Snippet>` on any page to render component variants.

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
    index.ts                  — Base entry: **types only** (the runtime authoring API lives in react/)
    types.ts                  — Shared **React-free** types (TypebookConfig, PropInfo, PropType, MetaConfig*, VariantConfig, MissingProps, …)
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into arrays
    constants.ts              — PACKAGE_NAME, NPM_REACT_PACKAGE_NAME, LOG_PREFIX, …
    cli.ts                    — CLI entry: prints that codegen runs as a bundler plugin (no generate step)
    core/                     — Single-pass per-module transform pipeline
      transform.ts            — transformTypebook(code, filePath, tsClient): parses once, runs both scanners,
                                injects __props / __snippetSource back into the source text (no file emitted).
                                SnippetNotInlineError lives here.
      meta-scanner.ts        — oxc AST: scanMetaCalls(program) finds getComponentMeta(Component, …) calls
                                and the position to inject __props (into config object, or as a new config arg)
      snippet-scanner.ts      — oxc AST: scanSnippets(program, src) finds every <Snippet>{fn}</Snippet>, slices the
                                inline function's body (non-inline child → null → build error) + the inject position
      ts-client.ts            — TypeScript Compiler API: extracts PropInfo[], defaultValues, JSDoc descriptions.
                                Extracts against the transform's `code` via an in-memory snapshot override so oxc
                                and TS offsets stay in lockstep even when an earlier plugin rewrote the module.
      ast.ts                  — Shared oxc-parser helpers (parseProgram → Program, walk) used by both scanners
    plugins/                  — unplugin-based bundler integration
      factory.ts              — unpluginFactory + createUnplugin (shared across all bundlers)
      vite.ts                 — typebook() Vite plugin
      rollup.ts               — typebook() Rollup plugin
      rolldown.ts             — typebook() Rolldown plugin
      webpack.ts              — typebook() webpack plugin
      rspack.ts               — typebook() Rspack plugin
      esbuild.ts              — typebook() esbuild plugin
      farm.ts                 — typebook() Farm plugin
    react/                          — Runtime + authoring API, organized by Feature-Sliced Design
      index.ts                      — Public exports (incl. getComponentMeta / allOf / values / generate)
      getComponentMeta.ts          — getComponentMeta(Component, config?) → ComponentMeta (component, defaultProps, props)
      types.ts                      — React-coupled types: ComponentMeta / PropsOf / DefaultedOf (reference ComponentType)
      variants.ts                   — allOf(of, prop), values(of, prop, vs), generate(of, prop, fn, n)
      (no root provider — handles and snippets carry their own data, injected at build time)
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
          lib/isControllable.ts     — whether the Playground can render a control for a prop
        Snippet/                    — <Snippet>{children}</Snippet> — live render + "show source" toggle
          ui/Snippet.tsx            — Renders children; toggle reveals the injected __snippetSource prop (no fetch, no context)
        docs-sidebar/               — <DocsSidebar sections={…} current onNavigate/> — collapsible docs nav + mobile drawer
        docs-toc/                   — <DocsToc/> "On this page" + useDocHeadings() (collect + scrollspy + jump)
        breadcrumbs/                — <Breadcrumbs items={[…]}/> — chevron trail above a docs title
        prev-next-nav/              — <PrevNextNav prev next onPrev onNext/> — footer page cards
      features/                     — Interactive units
        prop-input/                 — <PropInput> per-prop controls (literal/bool/string/number)
        code-block/                 — <CodeBlock tabs|code file lang showLineNumbers highlightLines/> —
                                      the one code component; lib/tokenize.ts — lazy Shiki singleton tokenizing
                                      with the One Light / One Dark Pro pair (codeToTokensWithThemes); each token
                                      carries both colors as --tk-l/--tk-d, theme.css picks one per [data-theme]
                                      (any language, theme-aware colors)
        search-palette/             — <SearchPalette index={…}/> — ⌘K palette + useSearchHotkeys() + SearchEntry
        copy-command/               — <CopyCommand cmd="npx …"/> — copy-able install-command pill
      entities/                     — Domain entities
        theme/                      — Light/dark theme with localStorage + system preference
        (no component-meta / snippets entities — handles and snippets carry their own data, injected at build time)
      shared/                       — Reusable primitives
        ui/Preview/                 — <Preview>, <PreviewFrame>, <Isolate>, <ErrorBoundary>
        ui/{accordion,callout,cards,md-table,props-reference,steps,tabs,prose,headings}/
                                      — the Markdown/MDX content set, one folder per component
                                        (no "md" wrapper folder): Callout, MDTable, PropsReference,
                                        Tabs, Steps, Accordion, Cards/DocCard, prose (P/Lead/C/A/
                                        Ul/Ol/Li/Hr/Quote/ImgPlaceholder), headings (H2/H3)
        lib/getGridStyle.ts         — CSS grid layout for variant grids
        lib/formatPropType.ts       — render a PropInfo's type as a string ("sm" | "md", …)
        lib/propsToRows.ts          — map a handle's extracted props → PropsReference rows (auto props table)
        lib/slugify.ts, childText.ts — heading anchor helpers used by the content set
        config/styles.css           — Typebook UI styles (Tailwind)
        config/cssConstants.ts      — CSS constants (CENTERED_CONTENT_STYLE, IFRAME_STYLE)
```

### Build entry points

- **`index`** — **React-free** types only (`TypebookConfig`, `PropInfo`, `PropType`, `MetaConfig*`, `VariantConfig`, …). Authoring API and React-coupled types (`ComponentMeta`) live in `react/`.
- **`react/index`** — authoring API (`getComponentMeta`, `allOf`, `values`, `generate`) + `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `ErrorBoundary` + the docs component kit (content set, `CodeBlock`, `SearchPalette`, `DocsSidebar`, `DocsToc`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`, `PropsReference`, `propsToRows`). Domain types come from the base entry, not re-exported here.
- **`plugins/vite`** (and `plugins/{rollup,rolldown,webpack,rspack,esbuild,farm}`) — `typebook()` plugin for each bundler, built from one shared `unpluginFactory`.
- **`cli/index`** — `npx @dennation/typebook` (prints plugin usage; there is no codegen step).

### Package exports

- `@dennation/typebook` — **React-free types only** (`TypebookConfig`, `MetaConfigPick`, `MetaConfigOmit`, `MetaConfigBase`, `PropInfo`, `PropType`, `MissingProps`, `VariantConfig`, …). No `react` import. Authoring API and React-coupled types live in `/react`.
- `@dennation/typebook/react` — **authoring API:** `getComponentMeta`, `allOf`, `values`, `generate` + the React-coupled types `ComponentMeta`/`PropsOf`/`DefaultedOf` (React-free domain types come from the base entry). **storybook runtime:** `Layout`, `Story`, `Variants`, `Matrix`, `Playground`, `Snippet`, `ErrorBoundary`. **docs kit** (for consumer documentation sites): content set (`Callout`, `MDTable`, `PropsReference`, `Tabs`, `Steps`/`Step`, `Accordion`, `Cards`/`DocCard`, `H2`/`H3`, `P`/`Lead`/`C`/`A`/`Ul`/`Ol`/`Li`/`Hr`/`Quote`, `ImgPlaceholder`), `CodeBlock` (tabs/filename/line numbers/highlight lines; Shiki with the One Light / One Dark Pro theme pair, each token carrying both colors so highlighting follows the theme — any language, theme-aware colors, lazy-loaded grammars), `SearchPalette`/`useSearchHotkeys`/`SearchEntry`, `DocsSidebar`/`DocsNavSection`, `DocsToc`/`useDocHeadings`/`DocsHeading`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`, `propsToRows` (maps a handle's extracted `props` into `PropsReference` rows for an auto props table), `slugify`/`childText`. **universal primitives:** `Button`/`buttonClass`/`ARROW_CLASS`, `ThemeToggle`, `cx`. Icons are **not** exported — they are imported directly from `lucide-react` (brand glyphs from `@tabler/icons-react`) at each call site.
- `@dennation/typebook/vite` — `typebook()` Vite plugin (also default export). Same `typebook()` factory is published from `/rollup`, `/rolldown`, `/webpack`, `/rspack`, `/esbuild`, `/farm` via [unplugin](https://unplugin.unjs.io)

> **What lives where.** The package exports only what is **universal** — the storybook runtime, the docs component kit (content set, CodeBlock, search palette, sidebar/toc/breadcrumbs/prev-next, CopyCommand), generic primitives (`Button`, `ThemeToggle`, `cx`) and the design system. Anything **specific to one site** (marketing landing sections, demo "gifs", section heading, scroll-reveal hook, layout constants, page content and nav data) lives in that app — see `apps/website`, not the package.

> **Design system.** The package ships one OKLCH token system in `src/react/shared/config/theme.css` (`--bg`/`--fg`/`--accent`/… with a `[data-theme="dark"]` block), re-exported into Tailwind utilities via `@theme inline` (`bg-bg`, `text-fg-muted`, `border-border`, `text-accent`, `bg-accent-soft`, …) and including the `.reveal`/`.in` helpers, the `.tb-tok` live-highlight rule + keyframes. The old `st:`-prefixed token set is gone; the storybook UI and any consumer site read these tokens. `shared/config/styles.css` (`@import "tailwindcss"` + theme + `@source`) is injected at runtime by `<Layout>`; a consumer that renders its own page (not via `<Layout>`) supplies the CSS itself by importing the shared `theme.css` and `@source`-scanning its components (see `apps/website`).

> Navigation menus live in a **separate package**, `@dennation/menu` — see its section below. Typebook no longer exports `defineMenu`/`Menu`/`menuFromRouteTree`.

### getComponentMeta() API

```ts
import { allOf, getComponentMeta } from '@dennation/typebook/react'
import { Matrix, Story, Variants } from '@dennation/typebook/react'
import { Button } from '../components/Button'

const button = getComponentMeta(Button, {
  defaultProps: { children: 'Click me' },
})

<Story of={button} />
<Variants of={button} items={allOf(button, 'size')} />
<Matrix of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
```

- **No id.** `getComponentMeta(Component, config?)` returns a self-contained `ComponentMeta` (`component`, `defaultProps`, `props`). `<Story>`/`<Variants>`/`<Matrix>`/`<Playground>` read everything from the handle — there is no registry, no context, no lookup by key.
- `getComponentMeta()` calls can live anywhere in `./src/**/*.{ts,tsx}` — no special filename required. They're **local**: import the handle to use it elsewhere; uniqueness isn't required, so there's no `DuplicateRegistrationError`.
- **`props` is injected at build time.** As authored, the handle's `props` is `[]`; the plugin's `transform` hook extracts `PropInfo[]` via the TS Compiler API and injects it as `__props` into the `getComponentMeta()` config (or as a new config argument when none was passed). Without the plugin (e.g. plain `tsc`/tests) the handle still type-checks — `props` is just empty, so `<Variants>`/`<Matrix>`/`<Playground>` degrade gracefully.
- `<Story>` / `<Variants>` / `<Matrix>` are **type-safe**: required props not covered by `defaultProps` must be passed via `props={…}` at the call site (`MissingProps` phantom type), inferred from `getComponentMeta`'s generics (not from the injected data).

### Snippet API

```tsx
import { Snippet } from '@dennation/typebook/react'

// inline arrow (stateless) — `name` is an optional label for the shown source
<Snippet name="button-group">
  {() => (
    <div className="flex gap-2">
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  )}
</Snippet>

// inline named function (hooks) — capitalized so rules-of-hooks recognises a component
<Snippet>
  {function Counter() {
    const [n, setN] = useState(0)
    return <Button onClick={() => setN(n + 1)}>Count: {n}</Button>
  }}
</Snippet>
```

- **The child is an inline function component, not raw JSX** — `children: () => ReactNode`. At runtime `<Snippet>` renders it as `<Demo/>` (so hooks work); the shown source is the **function body**.
- At build time the plugin's `transform` hook parses each module with **oxc-parser** and finds every `<Snippet>` element (imported from `@dennation/typebook/react`), slices the inline function's body 1:1 from the source (block body → between the braces; expression body → the expression, parens unwrapped), dedents it, and **injects it as a `__snippetSource` prop** on that same element. The child must be an **inline** function literal — a bare reference (`{Component}`) or raw JSX can't be sliced and raises a build error (`SnippetNotInlineError`, thrown from `core/transform.ts`).
- `name` is **optional** — a display label shown as the filename above the revealed source. It is no longer an identity key (there's no map), so it needn't be unique and there's no `DuplicateSnippetError`.
- At runtime the "show source" toggle reads the **injected `__snippetSource` prop** (no context, no `snippets.gen.ts`, no runtime fetch, no base-path concerns) and renders it through `<CodeBlock>`.
- Injection runs in the universal unplugin `transform` hook, so it works in every bundler. A snippet re-injects whenever its own module is re-transformed.

### Data flow

```
vite.config.ts: typebook()  → transform hook, per module (enforce: 'pre')
  └── transformTypebook(code, filePath, tsClient)   (oxc-parse once, run both scanners)
        ├── scanMetaCalls: finds getComponentMeta(Component, …) + inject position
        │     └── ts-client.getRegisterProps(code) → PropInfo[] (defaultValues + JSDoc)
        │           └── injects `__props: [...]` into the getComponentMeta() config
        └── scanSnippets: finds <Snippet>{fn}</Snippet> + slices source
              └── injects `__snippetSource={"…"}` onto the element

App.tsx:
  <RouterProvider router={router} />           ← TanStack Router (consumer's responsibility)
        ↓
  __root.tsx → Layout → <Outlet /> → page component
        ↓
  const button = getComponentMeta(Button, { /* __props injected here */ })
  <Story of={button} />        ← reads of.component / of.defaultProps
  <Variants of={button} …/>    ← reads of.props (the injected PropInfo[])
```

### Key design decisions

- **Injection over a generated file** — the plugin rewrites each module in its `transform` hook (injecting `__props` / `__snippetSource`) instead of emitting `ui-registry.gen.ts` / `snippets.gen.ts`. Data lives at the call site, so there's no central registry, no string-id indirection, no uniqueness errors, and no dev-server watcher graph — re-transformation is Vite's own module invalidation. Trade-off vs. a physical file: no on-disk artifact and no diff of extracted props (acceptable here — the registry was only ever consumed locally, not as a global catalog).
- **Self-contained handle** — `getComponentMeta(Component, config?)` returns `{ component, defaultProps, props }`. Type-safety of `<Story of={…}>` comes from `getComponentMeta`'s generics, not the injected data, so plain `tsc` works without the plugin.
- **No runtime provider** — handles and snippets carry their own data (injected at build time), so there is nothing to provide via context; the package exposes no `TypebookProvider`. Routing, history strategy, and route tree generation are the consumer's (`vite.config.ts` + `App.tsx`), which keeps any TanStack Router dependency out of the library.
- **Type extraction via TS Compiler API** — `ts-client.ts` resolves prop types as strings via `ts.TypeChecker`, extracts default values from destructuring patterns, and reads JSDoc via `symbol.getDocumentationComment()`. It extracts against the transform's `code` (via an in-memory snapshot override) so oxc and TS character offsets agree even when an earlier plugin already rewrote the module.

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
- **Opaque per-item `meta`, generic.** Items carry consumer metadata (badge, deprecated flag, counters — anything) via a generic `M` that threads through the whole chain (`MenuItem<M>` → `Menu<M>` → `MenuItemInput<Parent, M>` → `MenuItemProps<M>`/`MenuComponents<M>`). `M` defaults to **`never`** — a menu with no meta type has no usable `meta` (it's `undefined`). Give a shape via `defineMenu<MyMeta>(…)` (the generic is the **first** type param so `parent`-checking key inference still works) and `meta` is **that type everywhere, input and output** — no asymmetry, nothing synthesized. It's **required by default** (so the consumer's `Item`, typed `MenuItemProps<MyMeta>`, reads `item.meta.badge` with no optional chaining); to make it **optional/omittable per item**, give a type that admits `undefined` — `defineMenu<MyMeta | undefined>` (then `Item` reads `item.meta?.badge`). `meta` passes through verbatim — the renderer and `defineMenu` never read or synthesize it; the resolver stays meta-agnostic (internals run at `unknown`, the result is cast to `Menu<M>`). `menuFromRouteTree` reads it from `RouteMenuMeta<M>.meta`.
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
    App.tsx               — RouterProvider
    route-tree.gen.ts     — Auto-generated by @tanstack/router-plugin
    pages/
      __root.tsx          — TypebookLayout + sidebar nav + <Outlet />
      index.tsx
      about.tsx
      button.tsx          — getComponentMeta(Button, …) + Story/Variants/Matrix/Snippet
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

`@dennation/website` — the marketing landing + docs site, built from the Typebok design handoff. A Vite + React app with TanStack Router (file-based routes in `src/pages/`, basepath from `import.meta.env.BASE_URL` for GitHub Pages). Site-specific components live **here**; the docs UI itself (content set, CodeBlock, SearchPalette, DocsSidebar/DocsToc, Breadcrumbs, PrevNextNav, CopyCommand) comes from `@dennation/typebook/react`. Organized FSD-style: `pages/`, `entities/`, `shared/`, `widgets/`. Deployed to GitHub Pages by `.github/workflows/deploy-website.yml` (SPA fallback via `404.html`).

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
      docs.tsx            — /docs layout route: renders DocsShell + <Outlet/> (chrome once)
      docs.index.tsx      — redirect /docs → /docs/introduction
      docs.<slug>.tsx     — one file per docs page (docs.button.tsx, docs.callout.tsx, …):
                            createFileRoute("/docs/<slug>") + the page component inline.
                            Unknown slugs 404 (no map, no guard). autoCodeSplitting → one chunk per page
    entities/docs/nav.ts  — three `@dennation/menu` section menus (GETTING_STARTED/STORYBOOK/COMPONENTS,
                            keyed by /docs/<slug>), SECTIONS, NEW_PAGES, pageMeta() (title+section from the
                            menus), SEARCH_INDEX. Prev/next are authored per page (DocsFooter), not derived here
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
        DocsShell.tsx                         — /docs layout shell: DocsSidebar + <Outlet/> + DocsToc, current slug from useMatches()
        DocsFooter.tsx                        — per-page footer: "edit on GitHub" + prev/next as router <Link>s (props authored on each page)
        sidebar/{DocsSidebar,SidebarShell,SidebarSection,sidebarMenu}.tsx
                                              — sidebar: sections written out in JSX; items rendered via @dennation/menu,
                                                its Item a TanStack <Link> (active state from the router)
                                              (page content lives in the route files src/pages/docs.<slug>.tsx, not here;
                                               in-content nav is plain <Link>/useNavigate — no shared go() wrapper)
```

- **Styling.** `styles.css` imports the package's single source of truth, `packages/typebook/src/react/shared/config/theme.css`, and `@source`-scans both the app and `packages/typebook/src/react/**/*.tsx` (the latter so the universal primitives' utilities are emitted). Theme switching writes `data-theme` on `<html>` (key `typebook-theme`); a small inline script in `index.html` applies it before paint to avoid a flash.
- **Build order.** The site imports the built `@dennation/typebook` dist, so `pnpm -r run build` builds `typebook` first.

---

## User-facing API

### Bundler plugin (unplugin)

The plugin is built on [unplugin](https://unplugin.unjs.io), so the **same**
`typebook(config?)` factory is published per bundler — no bundler is privileged.
Work happens in the universal `transform` hook (`enforce: 'pre'`): each module
matching `*.{ts,tsx,js,jsx,…}` is scanned and rewritten in place, injecting
`__props` / `__snippetSource`. A single warm `TypeScriptClient` (lazily started on
the first transform) does the type extraction. The Vite entry additionally wires
the dev-server watcher to `notifyChange` the client so its warm program stays
fresh; a module re-injects through Vite's normal module invalidation. Other
bundlers re-run `transform` on each rebuild.

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
      // inheritedProviders: ['@heroui/theme'], // optional
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
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './route-tree.gen'

const router = createRouter({ routeTree, history: createHashHistory(), defaultPreload: 'intent' })

export default function App() {
  return <RouterProvider router={router} />
}
```

> No `TypebookProvider`, no `ui-registry.gen.ts` / `snippets.gen.ts` imports — prop metadata and snippet sources are injected into the call sites at build time, so `App.tsx` is just the router.

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
import { allOf, getComponentMeta } from '@dennation/typebook/react'
import { Matrix, Story, Variants } from '@dennation/typebook/react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/Button'

const button = getComponentMeta(Button, { defaultProps: { children: 'Click me' } })

export const Route = createFileRoute('/button')({ component: ButtonPage })

function ButtonPage() {
  return (
    <>
      <Story of={button} />
      <Variants of={button} items={allOf(button, 'size')} />
      <Matrix of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
    </>
  )
}
```
