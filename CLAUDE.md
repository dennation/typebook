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
  studio/      — @dennation/studio (library + CLI)
  playground/  — @dennation/playground (Vite app using studio)
```

## Root files

- **`package.json`** — Workspace root. Private, delegates scripts to packages via `pnpm -r`.
- **`pnpm-workspace.yaml`** — Declares `packages/*` as workspace members.
- **`.gitignore`** — Ignores `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`.

---

## packages/studio

React component preview tool with automatic variant generation from TypeScript types.

### Commands

```bash
pnpm --filter @dennation/studio build       # Build with tsup (api + cli entries)
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
    types.ts                  — All shared types and default constants
    config.ts                 — defineConfig(), loadConfig(), resolveBreakpoints()
    api/
      index.ts                — Public package exports (setup, defineConfig, types)
      setup.ts                — setup() → { show(), showVariants() } runtime API
    parser/
      preview-parser.ts       — oxc AST parser for .preview.tsx files
      type-parser.ts          — Converts LSP hover strings → PropInfo[] via oxc
    lsp/
      client.ts               — Minimal JSON-RPC LSP client for tsgo (stdio)
    server/
      dev-server.ts           — Vite middleware-mode HTTP server, SSE, LSP polling
      scanner.ts              — Glob scanner for .preview.tsx + component registry builder
      sse.ts                  — SSE connection manager, pushes type updates to browsers
    ui/
      host-html.ts            — Main app shell HTML (sidebar, breakpoints, theme, iframe)
      frame-html.ts           — Iframe HTML (postMessage listener, error boundary, dynamic imports)
    cli/
      index.ts                — CLI entry: `npx @dennation/studio preview [--port=N]`
```

### Two build entry points

- **`api/index`** — Library exports (`setup`, `defineConfig`, types). Consumed by user code in `.preview.tsx` files. External: react, react-dom.
- **`cli/index`** — Node CLI binary. Starts the dev server. External: vite, express.

### Data flow

```
.preview.tsx  →  oxc parse  →  ParsedSetup / ParsedExport
                                      ↓
                              tsgo LSP hover  →  type string
                                      ↓
                              oxc parse "type T = {...}"  →  PropInfo[]
                                      ↓
                              buildRegistry()  →  ComponentEntry[]
                                      ↓
                    HTTP API /api/components  +  SSE /events
                                      ↓
                              Host UI (sidebar, iframe)
                                      ↓
                              postMessage → Frame (render component)
```

### Key design decisions

- **Vite in middleware mode** — the HTTP server handles Studio routes (host HTML, frame HTML, SSE, API), and falls through to Vite for module requests (`.tsx` imports, HMR).
- **Type extraction via LSP hover** — instead of building a custom TS compiler plugin, we spawn `tsgo` as a child process and use hover requests to get component prop types as strings. These strings are then parsed by oxc into structured `PropInfo[]`.
- **LSP polling** — the server polls tsgo every 500ms for the currently open preview. Changes in type info are pushed to browsers via SSE.
- **iframe isolation** — component previews render inside an iframe with the user's global CSS. The host communicates via `postMessage` (`RENDER`, `SET_THEME`).
- **Breakpoint scaling** — when the selected breakpoint width exceeds available space, the iframe is CSS-scaled: `transform: scale(availableWidth / breakpointWidth)`.

### Defaults

| Setting     | Value                                      |
|-------------|--------------------------------------------|
| Layout      | `{ type: 'row', gap: 16 }`                |
| Theme       | `'light'`                                  |
| Port        | `3000`                                     |
| LSP poll    | `500ms`                                    |
| Breakpoints | mobile: 375, tablet: 768, desktop: 1280    |

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
  vite.config.ts
  index.html
  studio.config.ts              — Studio configuration (preview includes, breakpoints)
  src/
    main.tsx                    — Vite entry point
    App.tsx                     — Demo app rendering test components
    components/
      types.ts                  — Shared types (Size, Variant, BaseProps, InteractiveProps)
      Button.tsx                — Button with inline props
      Button.preview.tsx        — Studio preview for Button
      ComposedButton.tsx        — Button with composed interfaces
      ComposedButton.preview.tsx — Studio preview for ComposedButton
      InlineButton.tsx          — Button with intersection type props
```

---

## User-facing API

### studio.config.ts

```ts
import { defineConfig } from '@dennation/studio'

export default defineConfig({
  preview: {
    styles: './src/styles/globals.css',
    include: './src/components/**/*.preview.tsx',
    breakpoints: true, // or { mobile: 375, tablet: 768, desktop: 1280 }
  },
})
```

### Component.preview.tsx

```ts
import { setup } from '@dennation/studio'
import { Button } from './Button'

export const button = setup(Button, {
  defaults: { children: 'Click me', onClick: () => {} },
  layout: { type: 'row', gap: 16 },
  theme: 'light',
})

export const Sizes = button.showVariants('size')
export const Variants = button.showVariants('variant', { props: { disabled: true } })
export const WithIcon = button.show({ children: 'Add' })
```
