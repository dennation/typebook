<div align="center">

# @dennation/ui-studio

**Automatic component stories from your TypeScript types.**

[![npm version](https://img.shields.io/npm/v/@dennation/ui-studio)](https://www.npmjs.com/package/@dennation/ui-studio)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Getting Started](#getting-started) · [API Reference](#api-reference) · [Examples](#examples) · [How It Works](#how-it-works)

</div>

---

UI Studio reads your component prop types at build time and generates every variant automatically — no manual enumeration, no stale docs.

- **Zero-config type extraction** — Reads `size: "sm" | "md" | "lg"` straight from TypeScript. No manual value lists.
- **Three story kinds** — `single` (one card), `variants` (grid), `matrix` (cross-product table).
- **Interactive props panel** — Tweak any prop live with auto-generated controls (dropdowns, toggles, inputs).
- **Iframe isolation** — Each variant renders in its own iframe. No CSS bleed.
- **Vite plugin** — Plugs into your existing Vite setup. No separate dev server.
- **Fully typed API** — Generic `define<Props>()` propagates your component types to every story helper.

## Getting Started

### Install

```bash
npm install @dennation/ui-studio
# or
pnpm add @dennation/ui-studio
```

### 1. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { uiStudio } from '@dennation/ui-studio/vite'

export default defineConfig({
  plugins: [
    react(),
    uiStudio(),
  ],
})
```

### 2. Write a story

```tsx
// src/stories/Button.stories.tsx
import { define } from '@dennation/ui-studio'
import { Button } from './Button'

const button = define(Button, {
  group: 'Forms',
  defaults: { children: 'Click me' },
  props: ['size', 'variant', 'color', 'disabled'],
})

export const Default = button.single({
  props: { size: 'md', variant: 'solid' },
})

export const Sizes = button.variants({
  items: button.allOf('size'),
})

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
import registry from './studio.registry.gen' // auto-generated

function App() {
  return <Studio registry={registry} />
}
```

Start Vite — the plugin scans your `*.stories.tsx` files, extracts types, and generates `studio.registry.gen.ts` + `studio.meta.gen.ts` automatically.

## API Reference

### `define(component, config?)`

Creates a story definition bound to a React component.

```ts
const button = define(Button, {
  title: 'Primary Button',  // display name override
  group: 'Forms',           // sidebar group
  defaults: { children: 'Click me' },
  props: ['size', 'variant', 'color'],  // limit which props to extract
})
```

| Option | Type | Description |
|---|---|---|
| `title` | `string` | Display name in the sidebar. Defaults to `displayName` or function name. |
| `group` | `string` | Sidebar group heading. |
| `defaults` | `Partial<Props>` | Default prop values applied to all stories. |
| `props` | `string[]` | Whitelist of props to include. Omit to include all. |

### Story methods

#### `button.single(config?)`

One card with fixed props.

```ts
export const Default = button.single({
  props: { size: 'md', variant: 'solid' },
})
```

#### `button.variants(config)`

Grid of variants for one prop.

```ts
export const Sizes = button.variants({
  items: button.allOf('size'),
  columns: 4,  // optional grid columns
})
```

#### `button.matrix(config)`

Cross-product table — columns from `x`, rows from `y`.

```ts
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant'), button.allOf('size')],
})
```

### Variant helpers

| Helper | Description |
|---|---|
| `button.allOf('size')` | All values from the TypeScript type (`"sm" \| "md" \| "lg"` becomes 3 variants) |
| `button.values('size', ['sm', 'lg'])` | Explicit list of values |
| `button.generate('id', () => crypto.randomUUID(), 5)` | Generate N values with a function |

### `<Studio />`

```tsx
import { Studio } from '@dennation/ui-studio/react'

<Studio
  registry={registry}  // from studio.registry.gen.ts
  theme="light"        // "light" | "dark"
/>
```

### Vite plugin options

```ts
uiStudio({
  include: './src/**/*.stories.tsx',      // glob pattern (default)
  output: './studio.registry.gen.ts',     // registry file path (default)
})
```

## Examples

### Auto-generate all literal union variants

If your component has `color: "primary" | "secondary" | "success" | "warning" | "danger"`, one line gives you every variant:

```ts
export const Colors = button.variants({
  items: button.allOf('color'),
  columns: 3,
})
```

### Boolean prop states

```ts
export const Disabled = button.variants({
  items: button.allOf('disabled'),
})
// Generates: disabled=true, disabled=false
```

### Manual values with base props

```ts
export const States = toggle.variants({
  items: toggle.values('isSelected', [false, true]),
  props: { color: 'success' },
})
```

### Full matrix

```ts
export const Matrix = button.matrix({
  x: button.allOf('color'),             // columns
  y: [button.allOf('variant')],         // rows
  props: { children: 'Button' },        // base props for every cell
})
```

## How It Works

```
*.stories.tsx
     │
     ▼
Vite plugin scans files ──► TypeScript Compiler API extracts prop types
                                        │
                                        ▼
                              oxc parses type strings into PropInfo[]
                                        │
                                        ▼
                              Generates studio.meta.gen.ts (extracted types)
                              Generates studio.registry.gen.ts (imports + assembly)
                                        │
                                        ▼
                              <Studio /> resolves allOf markers internally
                              and renders sidebar + stories
```

1. **Scan** — The Vite plugin finds all `*.stories.tsx` files matching the `include` glob.
2. **Extract** — TypeScript Compiler API resolves component prop types as strings.
3. **Parse** — [oxc](https://oxc.rs) parses type strings into structured `PropInfo[]` (literal unions, booleans, strings, numbers, nodes, functions).
4. **Generate** — Two files are written: `studio.meta.gen.ts` (extracted component metadata) and `studio.registry.gen.ts` (imports stories, configs, and meta into a registry array).
5. **Resolve** — At runtime, `<Studio />` resolves `allOf('size')` markers using a `Map<Component, ComponentMeta>` built from the registry.
6. **Render** — `<Studio />` renders a sidebar, interactive props panel, and story cards with iframe isolation.

The plugin watches for file changes and regenerates incrementally — only re-extracting types for changed files.

## Package Exports

```ts
import { define } from '@dennation/ui-studio'                    // Core API + types
import { Studio } from '@dennation/ui-studio/react'              // React components
import { uiStudio } from '@dennation/ui-studio/vite'             // Vite plugin
```

## Requirements

- React >= 18
- Vite >= 5
- TypeScript >= 5.7

## License

MIT
