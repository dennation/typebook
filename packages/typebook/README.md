<div align="center">

# @dennation/typebook

**Documentation site framework for React, built on TanStack Router.**

[![npm version](https://img.shields.io/npm/v/@dennation/typebook)](https://www.npmjs.com/package/@dennation/typebook)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

Typebook is a Vite plugin + React runtime for building documentation sites with file-based routing. It wraps `@tanstack/router-plugin` so pages in `src/pages/` automatically become routes — no manual route configuration.

> **Status: pre-release.** Branch `v2-concept`. API is unstable.

## Quick Start

### Install

```bash
npm install @dennation/typebook @tanstack/react-router
```

### 1. Add the Vite plugin

```ts
// vite.config.ts
import { typebook } from '@dennation/typebook/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [typebook({ docs: {} }), react()],
})
```

### 2. Create the root layout

```tsx
// src/pages/__root.tsx
import { TypebookLayout } from '@dennation/typebook/react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({ component: RootComponent })

function RootComponent() {
  return (
    <TypebookLayout
      sidebar={
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      }
    >
      <Outlet />
    </TypebookLayout>
  )
}
```

### 3. Add a page

```tsx
// src/pages/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({ component: AboutPage })

function AboutPage() {
  return <h1>About</h1>
}
```

### 4. Mount

```tsx
// src/App.tsx
import { RegistryProvider } from '@dennation/typebook/react'
import { routeTree } from './routeTree.gen'

export default function App() {
  return <RegistryProvider routeTree={routeTree} />
}
```

Run `vite dev` — the plugin generates `src/routeTree.gen.ts` automatically.

## MDX support

MDX is not bundled. Install `@mdx-js/rollup` and place it before `typebook()`:

```ts
import mdx from '@mdx-js/rollup'

plugins: [mdx(), typebook({ docs: {} }), react()]
```

Then write a route that uses an `.mdx` file as the component:

```tsx
// src/pages/getting-started.tsx
import { createFileRoute } from '@tanstack/react-router'
import Content from './getting-started.mdx'

export const Route = createFileRoute('/getting-started')({ component: Content })
```

```mdx
{/* src/pages/getting-started.mdx */}
import { Button } from '../components/Button'

# Getting Started

<Button>Live React component in markdown</Button>
```

## Component stories

`register(Component, config)` returns a descriptor that pairs with React components for rendering variants. Props are extracted from your TypeScript types at build time — no manual prop lists.

```tsx
// src/pages/button.tsx
import { allOf, register } from '@dennation/typebook'
import { MatrixStory, Story, VariantsStory } from '@dennation/typebook/react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/Button'

const button = register(Button, { defaults: { children: 'Click me' } })

export const Route = createFileRoute('/button')({
  component: () => (
    <>
      <Story of={button} />
      <VariantsStory of={button} items={allOf(button, 'size')} />
      <MatrixStory of={button} x={allOf(button, 'color')} y={[allOf(button, 'variant')]} />
    </>
  ),
})
```

Pass the auto-generated registry to `<RegistryProvider>` so the story components can resolve prop types:

```tsx
import { RegistryProvider } from '@dennation/typebook/react'
import registry from './ui-registry.gen'
import { routeTree } from './routeTree.gen'

export default () => <RegistryProvider registry={registry} />
```

`register()` calls can sit anywhere in the source tree — no need to export them. The plugin walks the AST, finds every `register(Component, ...)` call, and keys the registry by the **component reference**, so each component may be registered only once. A second registration triggers an error (downgradable to a warning via `onDuplicate: 'warn'`).

## Plugin options

```ts
typebook({
  docs: {
    routesDir: './src/pages',                       // default
    routeTreeOutput: './src/routeTree.gen.ts',      // default
  },
  sourceGlob: './src/**/*.{ts,tsx}',                // default — files scanned for register() calls
  registryFile: './src/ui-registry.gen.ts',         // default — generated registry file
  onDuplicate: 'error',                             // default — 'warn' to downgrade
})
```

Disable docs routing entirely by omitting `docs` (or setting it to `false`).

## Package Exports

| Import | Description |
|---|---|
| `@dennation/typebook` | React-free types (`TypebookConfig`, `PropInfo`, `MetaConfig*`, `VariantConfig`, …) |
| `@dennation/typebook/react` | `getComponentMeta`, `allOf`, `values`, `generate`, `Layout`, `Story`, `Variants`, `Matrix`, `Snippet`, `ErrorBoundary` + the docs component kit |
| `@dennation/typebook/vite` | `typebook` Vite plugin |

## Requirements

- React >= 18
- Vite >= 5
- TypeScript >= 5.7
- `@tanstack/react-router` (peer)
