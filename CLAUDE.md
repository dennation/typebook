# @dennation/typebook — monorepo

> **Branch scope — `main` is release-only.** `main` ships just the **scanner core** +
> **AI-instructions** plugin (`@dennation/typebook` + `@dennation/typebook/plugins/llm-instructions`
> + the `typebook()` bundler plugins). Everything else lives on the **`dev`** branch and is **not**
> on `main`: the stories API (`defineStories`, `@dennation/typebook/react`), the `snippets` plugin,
> the docs-kit runtime, the `@dennation/menu` package, the marketing/docs **website** and the
> **examples**. Much of the detail below (the `react/` runtime, `widgets/`, `packages/menu`,
> `apps/website`, `examples/*`, `defineStories`/`Snippet`/stories injection) describes the **full
> product on `dev`** — on `main` those files don't exist. When working on `main`, treat this file's
> `react`/menu/website/examples/stories sections as dev-only context.

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

React component documentation library. The `typebook()` bundler plugin does two things from one TypeScript-Compiler-API scan: (1) **scans** the components named by its `components` config (path/glob) by type into structured `ComponentInfo`s (props, defaults, JSDoc) — no wrapper call needed; **sub-plugins** turn that scan into artifacts (`llmInstructions()` writes Markdown docs for AI agents; `snippets()` handles `<Snippet>`); and (2) **injects** at build time — `__props` into each `defineStories()` call, `__snippetSource` onto each `<Snippet>` element. No registry files. Consumers author `defineStories(Component, config?)` → a `{ Story, Variants, Matrix }` namespace (component baked in; axes are prop names) and embed `<XStories.Variants axis="size" />` / `<Snippet>` on any page (each story view takes an optional `interactive` prop for editable, per-preview props).

### Commands

```bash
pnpm --filter @dennation/typebook build       # Build with Vite (multiple entry points)
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
    index.ts                  — Base entry: re-exports the **scanner core** (the library foundation) + all React-free types
    types.ts                  — Shared **React-free** types (TypebookConfig incl. components/plugins, ComponentInfo, TypebookPlugin, PropInfo, PropType, VariantConfig, MissingProps, …)
    resolve.ts                — resolveVariantConfig() — resolves VariantConfig markers into arrays
    constants.ts              — PACKAGE_NAME, NPM_REACT_PACKAGE_NAME, LOG_PREFIX, …
    cli.ts                    — CLI entry: prints that codegen runs as a bundler plugin (no generate step)
    scanner/                  — React-free extraction core (re-exported from the base `.` entry — the library foundation)
      index.ts                — Public exports: collectComponentInfos, TypeScriptClient,
                                scanMetaCalls, scanSnippets, parseProgram, injectMetaProps, applyEdits, …
      transform.ts            — injectMetaProps(program, filePath, code, tsClient) → Edit[] (props injection only);
                                applyEdits(code, edits). The factory orchestrates one parse + these + transform plugins.
      collectComponentInfos.ts — collectComponentInfos(client, files) → ComponentInfo[] (export-based scan of configured files)
      meta-scanner.ts        — oxc AST: scanMetaCalls(program) finds defineStories(Component, …) calls
                                and the position to inject __props (into config object, or as a new config arg)
      snippet-scanner.ts      — oxc AST: scanSnippets(program, src) finds every <Snippet>{fn}</Snippet>, slices the
                                inline function's body (non-inline child → null → build error) + the inject position
      ts-client.ts            — TypeScript Compiler API: getProps / getExportedComponentInfos / getSnippetSource.
                                Extracts PropInfo[], defaults, JSDoc; getExportedComponentInfos finds components by type.
      ast.ts                  — Shared oxc-parser helpers (parseProgram → Program, walk) used by both scanners
    plugins/                  — unplugin-based bundler integration + sub-plugins
      factory.ts              — unpluginFactory + createUnplugin. Orchestrates: project scan (buildStart/dev-watch)
                                → generate sub-plugins; and per-module transform (one parse → injectMetaProps +
                                transform sub-plugins → applyEdits). Resolves `components` glob via fs.globSync.
      snippets.ts             — snippets() transform sub-plugin (<Snippet> injection) + SnippetNotInlineError. Opt-in.
      llm-instructions/       — llmInstructions() generate sub-plugin (its own folder; card rendering is plugin-local, not core):
        index.ts              — llmInstructions(): ComponentInfo[] → per-component Markdown cards + an llms.txt index
        componentToMarkdown.ts — componentToMarkdown(doc) → one Markdown card (import + description + @remarks + props table)
        formatPropType.ts     — render a PropInfo's type as a string ("sm" | "md", …)
      vite.ts                 — typebook() Vite plugin
      rollup.ts               — typebook() Rollup plugin
      rolldown.ts             — typebook() Rolldown plugin
      webpack.ts              — typebook() webpack plugin
      rspack.ts               — typebook() Rspack plugin
      esbuild.ts              — typebook() esbuild plugin
      farm.ts                 — typebook() Farm plugin
    react/                          — Runtime + authoring API, organized by Feature-Sliced Design
      index.ts                      — Public exports (defineStories + docs kit; NO getComponentMeta/allOf/values/generate, NO standalone Story/Variants/Matrix)
      defineStories.tsx            — defineStories(Component, config?) → { Story, Variants, Matrix, props } namespace (component baked in; axes = prop names). Wraps the internal widgets + translates axis/values/generate props → VariantConfig
      types.ts                      — React-coupled types: ComponentMeta / PropsOf / DefaultedOf (internal; referenced by defineStories + the widgets)
      (no root provider — handles and snippets carry their own data, injected at build time)
      widgets/                      — Large public blocks
        Layout/                     — <Layout sidebar={…}>{children}</Layout>
        Story/                      — <Story of={reg} props={…} title? showSource? interactive? /> — single variant
        Variants/                   — <Variants of={reg} items={…} title? showSource? interactive? /> — prop axis grid
        Matrix/                     — <Matrix of={reg} x={…} y={[…]} title? showSource? interactive? /> — cross-product table
          ui/MatrixTable.tsx        — Table layout only (calls renderCell(cell) per cell)
          lib/buildMatrixRows.ts    — Pure builder (testable without React)
        (no Playground widget — "play with props" is the per-preview `interactive` prop on
         Story/Variants/Matrix; each cell holds its own state. See features/prop-input.)
        Snippet/                    — <Snippet>{children}</Snippet> — live render + "show source" toggle
          ui/Snippet.tsx            — Renders children; toggle reveals the injected __snippetSource prop (no fetch, no context)
        docs-sidebar/               — <DocsSidebar sections={…} current onNavigate/> — collapsible docs nav + mobile drawer
        docs-toc/                   — <DocsToc/> "On this page" + useDocHeadings() (collect + scrollspy + jump)
        breadcrumbs/                — <Breadcrumbs items={[…]}/> — chevron trail above a docs title
        prev-next-nav/              — <PrevNextNav prev next onPrev onNext/> — footer page cards
      features/                     — Interactive units
        prop-input/                 — prop-editing UI: <PropInput> per-prop controls
                                      (literal/bool/string/number/node); PropsTable (search +
                                      filter + rows) + PropRow + lib/isControllable; and
                                      InteractivePreview — a single preview that owns its own
                                      props state (used by Story/Variants/Matrix `interactive`),
                                      with a live "show source" panel reflecting the edits
        code-block/                 — <CodeBlock.Root>{<CodeBlock.Tab label lang file icon showLineNumbers
                                      highlightLines>{`code`}</CodeBlock.Tab>…}</CodeBlock.Root> — a compound
                                      code component, always tabbed (a lone tab → one-tab bar; no single/tabs
                                      duality, no `code` prop). Each child in its own file:
                                        ui/CodeBlock.tsx     — the { Root, Tab } namespace object
                                        ui/CodeBlockRoot.tsx — root: collects tabs, owns active state, one layout
                                        ui/CodeBlockTab.tsx  — null marker; every code option lives on the tab
                                        ui/TabBar.tsx        — tab buttons + CopyButton for the active tab
                                        ui/CopyButton.tsx    — copy-to-clipboard button (useCopy)
                                        ui/CodeView.tsx      — the scrollable <pre>: tokenized lines + gutter/highlights
                                        lib/tabsFromChildren.ts — <CodeBlock.Tab> children → CodeTab[] model
                                        lib/useTokens.ts     — async Shiki tokens for one tab (null until resolved)
                                        lib/tokenize.ts      — lazy Shiki singleton tokenizing with the One Light /
                                      One Dark Pro pair (codeToTokensWithThemes); each token carries both colors as
                                      --tk-l/--tk-d, theme.css picks one per [data-theme] (any language, theme-aware)
        copy-command/               — <CopyCommand cmd="npx …"/> — copy-able install-command pill
      entities/                     — Domain entities
        theme/                      — Light/dark theme with localStorage + system preference
        (no component-meta / snippets entities — handles and snippets carry their own data, injected at build time)
      shared/                       — Reusable primitives
        ui/Preview/                 — <Preview>, <PreviewFrame>, <Isolate>, <ErrorBoundary>
        ui/{accordion,callout,cards,md-table,props-reference,steps,tabs,prose,headings}/
                                      — the Markdown/MDX content set, one folder per component
                                        (no "md" wrapper folder): Callout, MDTable, PropsReference,
                                        Tabs, Steps (compound Steps.Root + Steps.Step), Accordion, Cards/DocCard, prose
                                        (Paragraph/Lead/List (compound List.Root + List.Item)/Blockquote/Divider/Strong/Emphasis/
                                        InlineCode/Link/ImagePlaceholder — every prose element is a component carrying its own styles; there is
                                        NO `.doc-prose` container and no bare-tag styling), headings (single Heading with level={2|3})
        lib/getGridStyle.ts         — CSS grid layout for variant grids
        lib/formatPropType.ts       — render a PropInfo's type as a string ("sm" | "md", …)
        lib/propsToRows.ts          — map a handle's extracted props → PropsReference rows (auto props table)
        lib/slugify.ts, childText.ts — heading anchor helpers used by the content set
        config/styles.css           — Typebook UI styles (Tailwind)
        config/cssConstants.ts      — CSS constants (CENTERED_CONTENT_STYLE, IFRAME_STYLE)
```

### Build entry points

- **`index`** — the library **foundation**: the React-free **scanner core** (`collectComponentInfos`, `TypeScriptClient`, `scanMetaCalls`, `parseProgram`, `injectMetaProps`, …) + all React-free types (`TypebookConfig` incl. `components`/`plugins`, `ComponentInfo`, `TypebookPlugin`, `TransformCtx`, `GenerateCtx`, `PropInfo`, `PropType`, `VariantConfig`, …). Pulls `typescript` + `oxc-parser` at runtime; type-only imports stay weightless. Authoring API and React-coupled types live in `react/`.
- **`react/index`** — authoring API (`defineStories`) + `Layout`, `Snippet`, `ErrorBoundary` + the docs component kit (content set, `CodeBlock`, `DocsSidebar`, `DocsToc`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`, `PropsReference`, `propsToRows`). The internal `Story`/`Variants`/`Matrix` widgets are **not** exported standalone — they come out of `defineStories`. **No search** (a docs site wires its own — see `apps/website`).
- **`plugins/{snippets,llm-instructions}`** — sub-plugins for `typebook({ plugins: [...] })`: `snippets()` (transform: `<Snippet>` injection) and `llmInstructions()` (generate: Markdown docs from the scan).
- **`plugins/vite`** (and `plugins/{rollup,rolldown,webpack,rspack,esbuild,farm}`) — `typebook()` plugin for each bundler, built from one shared `unpluginFactory`.
- **`cli/index`** — `npx @dennation/typebook` (prints plugin usage; there is no codegen step).

### Package exports

- `@dennation/typebook` — the **foundation**: React-free **scanner core** (`collectComponentInfos`, `TypeScriptClient`, `scanMetaCalls`, `parseProgram`, `injectMetaProps`, …) + all React-free types (`TypebookConfig`, `ComponentInfo`, `TypebookPlugin`, `TransformCtx`, `GenerateCtx`, `PropInfo`, `PropType`, `MissingProps`, `VariantConfig`, …). No `react` import.
- `@dennation/typebook/plugins/snippets` — `snippets()`, `SnippetNotInlineError`.
- `@dennation/typebook/plugins/llm-instructions` — `llmInstructions()`, `LlmInstructionsOptions`.
- `@dennation/typebook/react` — **authoring API:** `defineStories` (+ its types `StoriesNamespace`/`StoryViewProps`/…). **storybook runtime:** `Layout`, `Snippet`, `ErrorBoundary` (story views come from `defineStories`, sharing `title` / `showSource` / `interactive`). **docs kit** (for consumer documentation sites): content set (`Callout`, `MDTable`, `PropsReference`, `Tabs`, `Steps` (compound `Steps.Root` + `Steps.Step`), `Accordion`, `Cards`/`DocCard`, `Heading` (single component, `level={2|3}`), `Paragraph`/`Lead`/`List` (compound `List.Root` + `List.Item`)/`Blockquote`/`Divider`/`Strong`/`Emphasis`/`InlineCode`/`Link`/`ImagePlaceholder` (component-only prose set — every element carries its own styles; no `.doc-prose` container, no bare-tag styling)), `CodeBlock` (compound `CodeBlock.Root` + `CodeBlock.Tab`, always tabbed — per-tab filename/lang/icon/line numbers/highlight lines, no `code` prop; Shiki with the One Light / One Dark Pro theme pair, each token carrying both colors so highlighting follows the theme — any language, theme-aware colors, lazy-loaded grammars), `DocsSidebar`/`DocsNavSection`, `DocsToc`/`useDocHeadings`/`DocsHeading`, `Breadcrumbs`, `PrevNextNav`, `CopyCommand`, `propsToRows` (maps a handle's extracted `props` into `PropsReference` rows for an auto props table), `slugify`/`childText`. **universal primitives:** `Button`/`buttonClass`/`ARROW_CLASS`, `ThemeToggle`, `cx`. Icons are **not** exported — they are imported directly from `lucide-react` (brand glyphs from `@tabler/icons-react`) at each call site.
- `@dennation/typebook/vite` — `typebook()` Vite plugin (also default export). Same `typebook()` factory is published from `/rollup`, `/rolldown`, `/webpack`, `/rspack`, `/esbuild`, `/farm` via [unplugin](https://unplugin.unjs.io)

> **What lives where.** The package exports only what is **universal** — the storybook runtime, the docs component kit (content set, CodeBlock, sidebar/toc/breadcrumbs/prev-next, CopyCommand), generic primitives (`Button`, `ThemeToggle`, `cx`) and the design system. Anything **specific to one site** (marketing landing sections, demo "gifs", section heading, layout constants, page content and nav data) lives in that app — see `apps/website`, not the package.

> **Design system.** The package ships one OKLCH token system in `src/react/shared/config/theme.css` (`--bg`/`--fg`/`--accent`/… with a `[data-theme="dark"]` block), re-exported into Tailwind utilities via `@theme inline` (`bg-bg`, `text-fg-muted`, `border-border`, `text-accent`, `bg-accent-soft`, …) and including the `.reveal` scroll-driven animation helper, the `.tb-tok` live-highlight rule + keyframes. The old `st:`-prefixed token set is gone; the storybook UI and any consumer site read these tokens. `shared/config/styles.css` (`@import "tailwindcss"` + theme + `@source`) is injected at runtime by `<Layout>`; a consumer that renders its own page (not via `<Layout>`) supplies the CSS itself by importing the shared `theme.css` and `@source`-scanning its components (see `apps/website`).

> Navigation menus live in a **separate package**, `@dennation/menu` — see its section below. Typebook no longer exports `defineMenu`/`Menu`/`menuFromRouteTree`.

### defineStories() API

```ts
import { defineStories } from '@dennation/typebook/react'
import { Button } from '../components/Button'

export const ButtonStories = defineStories(Button, {
  defaultProps: { children: 'Click me' },
})

<ButtonStories.Story />
<ButtonStories.Variants axis="size" />
<ButtonStories.Matrix x="color" y={['variant']} />
```

- **Namespace, no `of`.** `defineStories(Component, config?)` returns a `{ Story, Variants, Matrix }` namespace with the component baked in, plus `.props` (the scanned `PropInfo[]`, e.g. for a `PropsReference` table). There is no registry, no context, no `getComponentMeta`, no standalone `<Story of={…}>`.
- **Axes are prop names (`keyof`).** `allOf`/`values`/`generate` are gone — a variant axis is a prop name: `axis="size"` (all values of the union), `values={[…]}` (explicit), or `generate={fn} count={n}`. `Matrix` takes `x`/`y` the same way. All type-checked against the component's props.
- **`defaultProps` are story-level** (author's presentation), not component metadata — they live in the `config`, next to the views. There's no `pick`/`omit`; every prop is scanned.
- **`props` is injected at build time.** As authored, `.props` is `[]`; the plugin extracts `PropInfo[]` via the TS Compiler API and injects it as `__props` into the `defineStories()` config (the return type carries `Props` as its first type argument, so the same extraction seam works). Without the plugin (plain `tsc`/tests) it still type-checks — `.props` is just empty.
- **Type-safe:** required props not covered by `defaultProps` must be passed via `props={…}` on the view (`MissingProps` phantom type), inferred from `defineStories`'s generics.
- **Registration for AI instructions is separate:** point `typebook({ components })` at your components (glob) — the scan extracts every exported component by type, no `defineStories` wrapper needed. `defineStories` is only for rendering stories.

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

// reference an example declared elsewhere (this file or an import) via `source={ref}` —
// `children` becomes a layout render-prop deciding WHERE/HOW preview + source appear
<Snippet source={ButtonDemo}>
  {({ preview, source }) => (
    <div className="grid grid-cols-2 gap-4">{preview}{source}</div>
  )}
</Snippet>
```

- **Two ways to give the example.** Either an **inline** function child (`children: () => ReactNode`; rendered as `<Demo/>` so hooks work, shown source = the function body), or a **`source={ref}` reference** to a function component declared elsewhere (same file or imported). With `source`, `children` is an optional **layout render-prop** `({ preview, source, code, name }) => ReactNode` (`source` is the ready `<CodeBlock>`, `code` the raw text) — omit it for the default card. The default card's "show source" toggle is purely presentational and lives in the card, not in any core.
- At build time the plugin's `transform` hook parses each module with **oxc-parser** and finds every `<Snippet>` element (imported from `@dennation/typebook/react`). For an **inline** child it slices the function's body 1:1 from the source (block body → between the braces; expression body → the expression, parens unwrapped), dedents it, and **injects it as a `__snippetSource` prop**. For a **`source={ref}`** it records the identifier and hands it to the **TypeScript client** (`ts-client.getSnippetSource`), which resolves the binding through the warm program — following an import alias into **another module** — to its declaration and slices that function's body the same way; the resolved file is returned so the plugin registers it via `addWatchFile` (editing the referenced module re-injects here). An inline child that is **not** a function literal (a bare reference `{Component}` or raw JSX) and has **no** `source` raises a build error (`SnippetNotInlineError`, thrown from `core/transform.ts`). The shared slicing helpers live in `core/source-slice.ts` (used by both the oxc scanner and the TS client).
- `name` is **optional** — a display label shown as the filename above the revealed source. It is no longer an identity key (there's no map), so it needn't be unique and there's no `DuplicateSnippetError`.
- At runtime the "show source" toggle reads the **injected `__snippetSource` prop** (no context, no `snippets.gen.ts`, no runtime fetch, no base-path concerns) and renders it through `<CodeBlock>`.
- Injection runs in the universal unplugin `transform` hook, so it works in every bundler. A snippet re-injects whenever its own module is re-transformed.

### Data flow

```
vite.config.ts: typebook({ components, plugins })
  ├── buildStart / dev-watch: project scan (React-free)
  │     └── collectComponentInfos(client, glob(components))  → ComponentInfo[] (props + JSDoc + deprecated)
  │           └── generate sub-plugins: llmInstructions() → writes .md; (others) → own artifacts
  └── transform hook, per module (enforce: 'pre')  → parse once, collect edits, apply
        ├── injectMetaProps: finds defineStories(Component, …) + injects `__props: [...]` into its config
        └── snippets() transform plugin: finds <Snippet>{fn}</Snippet> + injects `__snippetSource={"…"}`

button.stories.tsx:
  export const ButtonStories = defineStories(Button, { /* __props injected here */ })
  <ButtonStories.Story />                 ← component + defaultProps baked in
  <ButtonStories.Variants axis="size" />  ← reads injected __props to resolve the axis
```

### Key design decisions

- **One scan, many artifacts** — the `components` config drives a single by-type export scan (`ComponentInfo[]`); every sub-plugin reads that one result (a component is never parsed twice). `llmInstructions()` writes Markdown; `snippets()` and the `defineStories` `__props` injection are per-module transform work sharing the same warm `TypeScriptClient`.
- **Injection over a generated file** — the plugin rewrites each module in its `transform` hook (injecting `__props` into `defineStories()`, `__snippetSource` onto `<Snippet>`) instead of emitting registry/`snippets.gen.ts`. Data lives at the call site; re-transformation is the bundler's own module invalidation.
- **`defineStories` namespace** — `defineStories(Component, config?)` returns `{ Story, Variants, Matrix, props }` with the component baked in (no `of`). Type-safety comes from its generics (return type `StoriesNamespace<Props>` carries `Props` first, which is also the injection seam), so plain `tsc` works without the plugin. Axes are prop names (`keyof`), not `allOf`/`values`/`generate` calls.
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
      button.tsx          — defineStories(Button, …) → ButtonStories.Story/Variants/Matrix + Snippet
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

`@dennation/website` — the marketing landing + docs site, built from the Typebook design handoff. A Vite + React app with TanStack Router (file-based routes in `src/pages/`, basepath from `import.meta.env.BASE_URL` for GitHub Pages). Site-specific components live **here**; the docs UI itself (content set, CodeBlock, DocsSidebar/DocsToc, Breadcrumbs, PrevNextNav, CopyCommand) comes from `@dennation/typebook/react`. The ⌘K search palette is **site-local** (`src/features/search`), not from the package. Organized FSD-style: `pages/`, `entities/`, `shared/`, `widgets/`. Deployed to GitHub Pages by `.github/workflows/deploy-website.yml` (SPA fallback via `404.html`).

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
    features/search/      — site-local ⌘K search: SearchPalette + useSearchHotkeys + SearchEntry
                            (moved out of the package — typebook ships no search in early versions)
    shared/
      lib/{landingLayout.ts, siteLinks.ts}   — class constants + GITHUB_URL (scroll-reveal is pure CSS in theme.css, no hook)
      ui/SectionHead.tsx                      — section eyebrow + title + subtitle
    widgets/
      layout/{RootLayout.tsx, ShellContext.ts} — root shell: header, global ⌘K search, docs drawer state
      SiteHeader.tsx                          — unified sticky header (nav, search, theme, CTA)
      Landing.tsx                             — composes the landing sections
      SiteFooter.tsx
      LandingHero.tsx, LandingFeatures.tsx, LandingCompare.tsx, LandingStats.tsx, LandingCta.tsx
      demos/{DemoVariants,DemoTree,DemoTheme,DemoMdx}.tsx + demoClasses.ts   — looping feature "gifs"
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
    typebook(),
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

> No `TypebookProvider`, no generated registry files — prop metadata (into `defineStories`) and snippet sources (onto `<Snippet>`) are injected into the call sites at build time, so `App.tsx` is just the router.

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
import { defineStories } from '@dennation/typebook/react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/Button'

const ButtonStories = defineStories(Button, { defaultProps: { children: 'Click me' } })

export const Route = createFileRoute('/button')({ component: ButtonPage })

function ButtonPage() {
  return (
    <>
      <ButtonStories.Story />
      <ButtonStories.Variants axis="size" />
      <ButtonStories.Matrix x="color" y={['variant']} />
    </>
  )
}
```
