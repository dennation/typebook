# Migrate from Storybook

A practical guide for migrating your component stories from Storybook to UI Studio.

## Why migrate?

| | Storybook | UI Studio |
|---|---|---|
| Lines per story | 15-40 | 3-10 |
| Prop values | Manual `argTypes` | Auto-extracted from TypeScript |
| All variants grid | Manual, one story per variant | `allOf('size')` — one line |
| Cross-product matrix | Not built-in | `matrix({ x, y })` — one line |
| Cold start | 5-15s (separate dev server) | <1s (Vite plugin, no separate server) |
| Config files | `.storybook/main.ts`, `preview.ts`, `manager.ts` | One line in `vite.config.ts` |
| Dependencies | 30+ packages | 1 package |

## Concept mapping

| Storybook | UI Studio | Notes |
|---|---|---|
| CSF `meta` export | `define(Component, config)` | |
| `args` | `defaults` | Applied to all stories |
| `argTypes` | Automatic from TypeScript | No manual configuration needed |
| `render` function | `button.single({ render })` | Only for custom rendering |
| Decorators (global) | `storyWrapper` on `<Studio />` | Wraps all stories and Playground previews |
| Decorators (per-component) | `wrapper` in `define()` | Wraps all stories of a component |
| Controls addon | Built-in Playground | Auto-generated from prop types |
| `tags: ['autodocs']` | Always on (or `docs: false`) | Each component gets an API page |
| Docs addon / MDX | `definePage()` + `.page.tsx` | |
| `play` function | Not yet supported | |
| Actions addon | Not yet supported | |
| Viewport addon | Not yet supported | |

## Step-by-step migration

### 1. Install and configure

Remove Storybook:

```bash
npm uninstall @storybook/react @storybook/react-vite @storybook/addon-essentials # ... etc
rm -rf .storybook
```

Install UI Studio:

```bash
npm install @dennation/ui-studio
```

Add the plugin to your Vite config:

```ts
// vite.config.ts
import { uiStudio } from '@dennation/ui-studio/vite'

export default defineConfig({
  plugins: [
    react(),
    uiStudio(), // that's it
  ],
})
```

### 2. Create the Studio entry point

```tsx
// src/main.tsx (or a dedicated route)
import { Studio } from '@dennation/ui-studio/react'
import registry from './ui-studio-registry.gen'

function App() {
  return <Studio registry={registry} />
}
```

### 3. Migrate stories

This is the core of the migration. Below are before/after examples for common patterns.

---

## Before / After

### Basic story with args

**Storybook (25 lines):**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['solid', 'outline', 'ghost'] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Click me',
    size: 'md',
    variant: 'solid',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 'lg' } }
export const Outline: Story = { args: { variant: 'outline' } }
```

**UI Studio (10 lines):**

```tsx
import { define } from '@dennation/ui-studio'
import { Button } from './Button'

const button = define(Button, {
  path: 'Components',
  defaults: { children: 'Click me' },
})

export const Default = button.single({ props: { size: 'md', variant: 'solid' } })
export const Large = button.single({ props: { size: 'lg', variant: 'solid' } })
export const Outline = button.single({ props: { size: 'md', variant: 'outline' } })
export default button
```

`argTypes` is gone entirely. UI Studio reads `size: "sm" | "md" | "lg"` from your TypeScript types at build time.

### All variants of a prop

**Storybook (30+ lines):**

```tsx
export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const Large: Story = { args: { size: 'lg' } }

// or with a custom render:
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
```

**UI Studio (1 line):**

```tsx
export const Sizes = button.variants({ items: button.allOf('size') })
```

This generates a grid card for every value of `size` from the TypeScript type. When a new size is added to the type, the story updates automatically.

### Cross-product matrix

**Storybook:** No built-in support. You write a custom render function with nested loops, or one story per combination.

**UI Studio (4 lines):**

```tsx
export const Matrix = button.matrix({
  x: button.allOf('color'),
  y: [button.allOf('variant')],
})
```

Renders a table: colors as columns, variants as rows. Every cell is a live component.

### Decorators / providers

**Storybook:**

```tsx
// .storybook/preview.ts — global decorator
const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
}

// or per-story:
export const Default: Story = {
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
}
```

**UI Studio:**

```tsx
// Global wrapper — applies to all stories and Playground previews:
<Studio
  registry={registry}
  storyWrapper={(Story) => <ThemeProvider><Story /></ThemeProvider>}
/>

// Per-component wrapper (use when only some components need it):
const button = define(Button, {
  wrapper: (Story) => <SpecialProvider><Story /></SpecialProvider>,
  defaults: { children: 'Click me' },
})
```

Composition order: `storyWrapper` (global) → `wrapper` (per-component) → component render.

### Custom render function

**Storybook:**

```tsx
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icon name="star" />
      {args.children}
    </Button>
  ),
}
```

**UI Studio:**

```tsx
export const WithIcon = button.single({
  props: { size: 'md' },
  render: (props) => (
    <Button {...props}>
      <Icon name="star" />
      {props.children}
    </Button>
  ),
})
```

### Documentation pages (MDX)

**Storybook:**

```mdx
{/* Button.mdx */}
import { Meta, Story, Canvas, ArgsTable } from '@storybook/blocks'
import * as ButtonStories from './Button.stories'

<Meta of={ButtonStories} />

# Button

<Canvas of={ButtonStories.Default} />

## Props

<ArgsTable of={ButtonStories} />
```

**UI Studio:**

```tsx
// Button.page.tsx
import { definePage } from '@dennation/ui-studio'
import { Story, Playground } from '@dennation/ui-studio/react'
import button, { Default, Sizes } from './Button.stories'

export default definePage({
  name: 'Button Guide',
  path: 'Guides',
  content: () => (
    <div>
      <h1>Button</h1>
      <Story of={Default} />
      <h2>Sizes</h2>
      <Story of={Sizes} />
      <h2>Props</h2>
      <Playground of={button} />
    </div>
  ),
})
```

For markdown content, use `@mdx-js/rollup` with Vite:

```tsx
import Content from './button-guide.md'

export default definePage({
  name: 'Button Guide',
  content: () => <Content />,
})
```

### Hidden stories (for docs only)

**Storybook:**

```tsx
export const _DisabledStates: Story = {
  tags: ['!autodocs'],
  // ...
}
```

**UI Studio:**

```tsx
export const Disabled = button.variants({
  items: button.values('disabled', [false, true]),
  hidden: true, // hidden from sidebar, usable in docs via <Story of={Disabled} />
})
```

### Iframe isolation

**Storybook:** All stories render in an iframe by default (separate server).

**UI Studio:** Stories render inline by default (faster). Opt-in to iframe per story:

```tsx
export const Modal = modal.single({
  isolate: true, // renders in an iframe for full CSS/JS isolation
})
```

Use `isolate` for components that interact with `document` or `body` (modals, dropdowns with portals, tooltips).

---

## Migration checklist

- [ ] Install `@dennation/ui-studio`, add plugin to `vite.config.ts`
- [ ] Create Studio entry point (`<Studio registry={registry} />`) — add `storyWrapper` if you had global decorators
- [ ] For each `.stories.tsx`:
  - [ ] Replace `meta` + `argTypes` with `define(Component, config)`
  - [ ] Replace individual `Story` objects with `single()`, `variants()`, or `matrix()`
  - [ ] Replace decorators with `wrapper` in `define()`
  - [ ] Move `args` defaults to `defaults` in `define()`
  - [ ] Move custom renders to `render` in `single()`
- [ ] For MDX docs:
  - [ ] Convert to `.page.tsx` files using `definePage()`
  - [ ] Replace `<Canvas>` / `<Story>` blocks with `<Story of={...} />`
  - [ ] Replace `<ArgsTable>` with `<Playground of={...} />`
- [ ] Remove `.storybook/` directory and Storybook dependencies
- [ ] Run `pnpm dev` and verify all components render

## What's not yet supported

These Storybook features don't have a UI Studio equivalent yet:

| Feature | Status | Workaround |
|---|---|---|
| `play` functions (interaction testing) | Planned | Use Testing Library directly |
| Actions (event logging) | Planned | `console.log` in defaults |
| Viewport addon (responsive) | Planned | Use `isolate` + browser devtools |
| A11y addon | Planned | Use axe browser extension |
| Chromatic / visual regression | Not planned | Use Playwright screenshots |
| Component hierarchy (auto-title) | Not needed | `path` in `define()` serves the same purpose |
| `loaders` (async data) | Not needed | Use `defaults` with static data or `render` with hooks |

## File naming convention

| Storybook | UI Studio |
|---|---|
| `Button.stories.tsx` | `Button.stories.tsx` (same) |
| `Button.mdx` | `Button.page.tsx` (or `ButtonGuide.page.tsx`) |
| `.storybook/main.ts` | Line in `vite.config.ts` |
| `.storybook/preview.ts` | `storyWrapper` on `<Studio />` + `wrapper` in `define()` |
