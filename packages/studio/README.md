<div align="center">

# @dennation/ui-studio

**Zero-boilerplate component stories from your TypeScript types.**

[![npm version](https://img.shields.io/npm/v/@dennation/ui-studio)](https://www.npmjs.com/package/@dennation/ui-studio)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Quick Start](#quick-start) · [Features](#features) · [API Reference](#api-reference) · [Storybook Migration](MIGRATE-FROM-STORYBOOK.md)

<!-- TODO: replace with actual hero GIF -->
![UI Studio demo](https://placehold.co/800x400/1a1a2e/e2e2e2?text=Hero+GIF+coming+soon)

</div>

---

Write `allOf('size')` — get a grid of every variant. UI Studio reads your TypeScript prop types at build time and generates stories automatically. No `argTypes`, no manual value lists, no separate dev server.

## Storybook vs UI Studio

| | Storybook | UI Studio |
|---|---|---|
| Lines per story | 15-40 | 3-10 |
| Prop variants | Manual `argTypes` | Auto-extracted from TypeScript |
| All-variants grid | One story per value | `allOf('size')` — one line |
| Cross-product matrix | Not built-in | `matrix({ x, y })` — one line |
| Cold start | 5-15s (separate server) | <1s (Vite plugin) |
| Config files | `main.ts` + `preview.ts` + `manager.ts` | One line in `vite.config.ts` |
| Dependencies | 30+ packages | 1 package |

## Quick Start

### Install

```bash
npm install @dennation/ui-studio
```

### 1. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { uiStudio } from '@dennation/ui-studio/vite'

export default defineConfig({
  plugins: [react(), uiStudio()],
})
```

### 2. Write a story

```tsx
// src/stories/Button.stories.tsx
import { define } from '@dennation/ui-studio'
import { Button } from './Button'

const button = define(Button, {
  path: 'Forms',
  defaults: { children: 'Click me' },
})

export const Default = button.single({ props: { size: 'md', variant: 'solid' } })
export const Sizes = button.variants({ items: button.allOf('size') })
export const Colors = button.variants({ items: button.allOf('color'), columns: 3 })
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant')],
})

export default button
```

### 3. Render the Studio

```tsx
// src/main.tsx
import { Studio } from '@dennation/ui-studio/react'
import registry from './ui-studio-registry.gen'

function App() {
  return <Studio registry={registry} />
}
```

Start Vite — the plugin scans `*.stories.tsx`, extracts types, and generates the registry automatically.

## Features

### Single story — one card with fixed props

```ts
export const Default = button.single({
  props: { size: 'md', variant: 'solid' },
})
```

### Variants — grid of all values for a prop

```ts
export const Sizes = button.variants({ items: button.allOf('size') })
```

If your component has `size: "sm" | "md" | "lg"`, this generates 3 variant cards automatically. Add a new value to the type — the story updates with zero changes.

### Matrix — cross-product table

```ts
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant')],
})
```

Colors as columns, variants as rows. Every cell is a live component.

### Interactive Playground

Each component gets an auto-generated API page with live prop controls — dropdowns for literal unions, toggles for booleans, inputs for strings and numbers.

```tsx
import { Playground } from '@dennation/ui-studio/react'

<Playground of={button} />
```

### Documentation pages

```tsx
// src/docs/ButtonGuide.docs.tsx
import { definePage } from '@dennation/ui-studio'
import { Story } from '@dennation/ui-studio/react'
import { Default, Sizes } from '../stories/Button.stories'

export default definePage({
  name: 'Button Guide',
  path: 'Guides',
  content: () => (
    <div>
      <h1>Button</h1>
      <Story of={Default} />
      <h2>All sizes</h2>
      <Story of={Sizes} />
    </div>
  ),
})
```

Supports markdown via `@mdx-js/rollup`. Hidden stories (`hidden: true`) are excluded from the sidebar but embeddable in docs via `<Story of={...} />`.

### Iframe isolation

Stories render inline by default (fast). Opt-in to iframe per story for components that interact with `document` or `body`:

```ts
export const Modal = modal.single({ isolate: true })
```

## API Reference

### `define(component, config?)`

Creates a story definition bound to a React component.

```ts
const button = define(Button, {
  name: 'Button',            // display name override
  path: 'Forms',             // sidebar grouping via '/'
  defaults: { children: 'Click me' },
  props: ['size', 'variant', 'color'],  // limit which props to extract
  wrapper: (Story) => <Provider><Story /></Provider>,
  docs: true,                // auto-generate API page (default: true)
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | Component name | Display name in the sidebar |
| `path` | `string` | — | Sidebar path with nesting via `/` |
| `defaults` | `Partial<Props>` | — | Default props applied to all stories |
| `props` | `string[]` | All props | Limit which props to extract from types |
| `wrapper` | `(Story) => ReactNode` | — | Wrap all stories (e.g. with a provider) |
| `docs` | `boolean` | `true` | Auto-generate API page with Playground |

### Story methods

| Method | Description |
|---|---|
| `button.single(config?)` | One card with fixed props |
| `button.variants(config)` | Grid of variants from a prop |
| `button.matrix(config)` | Cross-product table: `x` columns, `y` rows |

**Common story config:**

| Option | Type | Description |
|---|---|---|
| `props` | `Partial<Props>` | Props for this story |
| `isolate` | `boolean` | Render in iframe for CSS/JS isolation |
| `name` | `string` | Display name override |
| `path` | `string` | Group within component sidebar section |
| `hidden` | `boolean` | Exclude from sidebar, usable in docs |

**Variants-specific:** `items` (VariantConfig), `columns` (number).
**Matrix-specific:** `x` (VariantConfig), `y` (VariantConfig[]).
**Single-specific:** `render` ((props) => ReactNode) for custom rendering.

### Variant helpers

| Helper | Description |
|---|---|
| `button.allOf('size')` | All values from the TypeScript type |
| `button.values('size', ['sm', 'lg'])` | Explicit list of values |
| `button.generate('id', () => randomId(), 5)` | Generate N values with a function |

### `definePage(config)`

Creates a standalone documentation page.

```ts
export default definePage({
  name: 'Getting Started',
  path: 'Guides',
  order: 1,
  content: () => <div>...</div>,
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Page name in the sidebar |
| `path` | `string` | — | Sidebar grouping via `/` |
| `order` | `number` | `0` | Sort order within group |
| `content` | `ComponentType` | — | React component to render |

### `<Studio />`

```tsx
<Studio
  registry={registry}    // from ui-studio-registry.gen.ts
  theme="light"          // "light" | "dark" (default: system)
  disableSearch={false}  // hide search bar
/>
```

### `<Story />`

Embeds a story inside a documentation page.

```tsx
import { Story } from '@dennation/ui-studio/react'
import { Sizes } from './Button.stories'

<Story of={Sizes} />
```

### `<Playground />`

Interactive component preview with live prop controls.

```tsx
import { Playground } from '@dennation/ui-studio/react'
import button from './Button.stories'

<Playground of={button} />
```

### Plugin options

```ts
uiStudio({
  include: './src/**/*.stories.tsx',      // story files glob
  includePages: './src/**/*.docs.tsx',    // doc page files glob
  output: './ui-studio-registry.gen.ts',  // registry output path
  metaOutput: './ui-studio-meta.gen.ts',  // meta output path
})
```

Webpack uses the same options via `new UiStudioWebpackPlugin({ ... })`.

## How It Works

1. **Scan** — Plugin finds `*.stories.tsx` and `*.docs.tsx` files matching the `include` globs.
2. **Extract** — TypeScript Compiler API resolves component prop types as strings.
3. **Parse** — [oxc](https://oxc.rs) parses type strings into structured `PropInfo[]` (literal unions, booleans, strings, numbers, nodes, functions).
4. **Generate** — Two files are written to disk: `ui-studio-meta.gen.ts` (extracted types) and `ui-studio-registry.gen.ts` (imports + registry assembly).
5. **Render** — `<Studio />` renders sidebar, interactive Playground, and story cards. Each story kind resolves variants lazily at render time.

The plugin watches for file changes and regenerates incrementally.

## Package Exports

| Import | Description |
|---|---|
| `@dennation/ui-studio` | `define`, `definePage`, types |
| `@dennation/ui-studio/react` | `Studio`, `Story`, `Playground`, `ErrorBoundary` |
| `@dennation/ui-studio/vite` | `uiStudio` Vite plugin |
| `@dennation/ui-studio/webpack` | `UiStudioWebpackPlugin` |

## Requirements

- React >= 18
- Vite >= 5 or Webpack >= 5
- TypeScript >= 5.7

## Coming from Storybook?

See the [Migration Guide](MIGRATE-FROM-STORYBOOK.md) for a step-by-step walkthrough with before/after code comparisons.

## License

MIT
