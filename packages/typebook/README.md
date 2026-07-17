<div align="center">

# @dennation/typebook

**Document your React components from their TypeScript types.**

One Compiler-API scan reads every component's props, defaults, JSDoc and deprecations; plugins turn that into whatever you need.

[![npm version](https://img.shields.io/npm/v/@dennation/typebook)](https://www.npmjs.com/package/@dennation/typebook)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## What it is

`@dennation/typebook` scans your components **by type** — a single TypeScript Compiler-API pass extracts each one's prop types, defaults, JSDoc and deprecations into a structured model (`ComponentInfo`). No wrapper calls, no decorators, no runtime.

That scan is the foundation; **plugins** consume it and emit artifacts. The one that ships today, [`llm-instructions`](#llm-instructions), writes documentation for AI coding agents.

> **Early release.** The scanner core and the `llm-instructions` plugin ship today; a stories / docs-kit runtime is in progress.

## Quick start

```bash
npm install -D @dennation/typebook
```

Add the bundler plugin and point `components` at your source — that runs the scan (once on build, live on change in dev). Enable a plugin under `plugins` to actually emit something:

```ts
// vite.config.ts
import { typebook } from "@dennation/typebook/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    typebook({
      components: "src/components/**/*.tsx",
      plugins: [
        // enable a plugin to emit artifacts — see llm-instructions below
      ],
    }),
    // …your framework plugin, e.g. react()
  ],
});
```

`typebook()` is published for [every bundler](#every-bundler), not just Vite.

## Plugins

A plugin receives the scan result (`ComponentInfo[]`) and produces artifacts. Enable it under `typebook({ plugins: [...] })`. A failing plugin only warns and leaves the build green by default; pass `typebook({ failOnError: true })` to fail the build in CI when generation breaks.

### `llm-instructions`

Writes documentation for AI coding agents (Claude Code, Codex, Cursor) following the [`llms.txt`](https://llmstxt.org) convention, so agents work from your components' **real** APIs instead of guessing. It emits one Markdown card per component plus an `llms.txt` index.

```ts
import { llmInstructions } from "@dennation/typebook/plugins/llm-instructions";
import path from "node:path";

// inside typebook({ plugins: [ … ] })
llmInstructions({
  // you build the full path — next to the component: components/Button.tsx → components/Button.md
  entryPath: (c, { componentDir }) => path.join(componentDir, `${c.name}.md`),
  indexPath: "llms.txt", // the index, relative to the project root
  importFrom: "@acme/ui", // the import line printed in each card
});
```

Point your agent's memory (`CLAUDE.md`, `AGENTS.md`) at the `indexPath`; it reads the card it needs on demand. For a **published** package, the docs travel differently — see [Shipping to a consumer project](#shipping-to-a-consumer-project).

Each card is self-contained — import line, description, `@remarks` usage guidance, deprecation, and a props table with exhaustive union values:

````md
## Button

A primary call-to-action button.

```tsx
import { Button } from "@acme/ui";
```

**Usage**

Use one primary button per view; pair it with a `variant="ghost"` button for
secondary actions. Put the label in `children`; don't nest interactive elements.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `variant` | `"solid" \| "outline" \| "ghost"` | `"solid"` | – | Visual style. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | – | Controls height and horizontal padding. |
| `fullWidth` | `boolean` | `false` | – | Stretch to fill the container's width. |
| `disabled` | `boolean` | `false` | – | Prevent interaction and dim the button. |
| `leftIcon` | `ReactNode` | – | – | Icon element rendered before the label. |
| `children` | `ReactNode` | – | ✔ | The button label. |
| `onPress` | `() => void` | – | – | Called when the button is activated. |
| `primary` | `boolean` | – | – | ⚠️ deprecated: Use `variant="solid"` instead. |
````

The usage note comes from the component's `@remarks` JSDoc; the exhaustive prop values come from the union types — both give the agent fewer ways to be wrong.

#### Options

| Option | Type | Description |
|---|---|---|
| `entryPath` **(required)** | `(component, { componentDir, root }) => string` | The full path of each card — you build it (the filename is explicit). Join `componentDir` for co-location or `root` for a central folder; return an absolute path (a relative one resolves against `root`). |
| `indexPath` **(required)** | `string \| false` | Path of the `llms.txt` index, or `false` to skip it. |
| `filterComponents` | `(component) => boolean` | Which components get a card and index entry (`true` keeps). Defaults to all. Use it to hide deprecated components or re-exports you don't own. |
| `importFrom` | `string \| (component) => string` | Module each component is imported from — prints the `import { X } from "…"` line. Omit to skip it. |
| `filterProps` | `PropFilter` (map or predicate) | Which props a card surfaces. A **map** keyed by group or prop name (`{ element: false, href: true }`, prop name wins, unlisted kept) or a predicate. Defaults to `DEFAULT_PROP_FILTER`; spread to override. Configures the default `format` only. |
| `keepOwnProps` | `boolean` | Keep a component's own props regardless of `filterProps`. Default `true`; `false` filters own props too. |
| `format` | `(component) => string` | How each component becomes its file's contents. Defaults to `markdownFormat` (the card above). Pass your own for a different shape — full `ComponentInfo` in, string out. |
| `title` / `description` | `string` | H1 title and blockquote summary of the `llms.txt` index. |

#### Recipes

**Choose where cards land** — `entryPath` gets `componentDir` and `root`, so pick the base:

```ts
import path from "node:path";

// next to each component
entryPath: (c, { componentDir }) => path.join(componentDir, `${c.name}.md`),
// or all in one folder at the project root
entryPath: (c, { root }) => path.join(root, "docs", `${c.name}.md`),
```

**Drop only some components** — hide deprecated ones, or re-exports you don't own:

```ts
llmInstructions({ filterComponents: (c) => c.deprecated === undefined });
```

**Tune the prop filter** — `filterProps` is a map keyed by group or prop name (`true` keeps, `false` hides; a prop name wins over its group, anything unlisted is kept). The default surfaces a component's own props plus a few broadly useful native names (`disabled`, `type`, `href`, …) and hides the rest. Spread `DEFAULT_PROP_FILTER` to adjust:

```ts
import { DEFAULT_PROP_FILTER } from "@dennation/typebook/plugins/llm-instructions";

llmInstructions({
  filterProps: {
    ...DEFAULT_PROP_FILTER,
    maxLength: true, // keep an inherited attribute the default drops
    onClick: false, // hide a specific prop
  },
});
```

For arbitrary logic, pass a predicate instead — `(prop, component) => boolean`. Own props stay visible either way unless you set `keepOwnProps: false`.

**Emit a different format** — `format` takes the scanned `ComponentInfo` and returns the file body, so you can produce JSON, MDX, anything (match the extension in `entryPath`):

```ts
llmInstructions({
  entryPath: (c, { componentDir }) => path.join(componentDir, `${c.name}.json`),
  format: (c) => JSON.stringify({ name: c.name, props: c.props }, null, 2),
});
```

**Extend the default card** instead of rewriting it — `markdownFormat` is the exported default:

```ts
import { markdownFormat } from "@dennation/typebook/plugins/llm-instructions";

const card = markdownFormat({ importFrom: "@acme/ui" });
llmInstructions({ format: (c) => `<!-- generated by typebook -->\n\n${card(c)}` });
```

**Title the index** (the `llms.txt` header):

```ts
llmInstructions({ title: "Acme UI", description: "Components for the Acme design system." });
```

#### Shipping to a consumer project

The generated docs are ordinary source files — cards co-located next to each component plus `llms.txt` at the root. Commit them (they're derived, so add a CI check that regenerating leaves the tree unchanged), then reach a downstream project in two steps. The name `llms.txt` triggers nothing on its own: no agent scans `node_modules` (or a website) for it.

1. **Include the docs in the package.** List their locations in `package.json#files` so npm packs them (it includes any listed committed file, not just `dist`):

   ```jsonc
   "files": ["dist", "llms.txt", "components/**/*.md"]
   ```

   The index links each card by relative path, so `node_modules/@acme/ui/llms.txt` resolves to the co-located cards as-is.

2. **Reference the index from the consumer's agent memory** — the file the agent auto-loads:

   - **CLAUDE.md** — `@import` inlines it into context: `@./node_modules/@acme/ui/llms.txt`
   - **AGENTS.md** — no import mechanism; a pointer line the agent opens on demand: `` UI component API (props, imports, usage): `./node_modules/@acme/ui/llms.txt` ``

Hosting the same `llms.txt` on your docs site is a second channel — a canonical URL for humans and URL-ingesting tools. Both come from one generation; write to both places.

## Every bundler

Built on [unplugin](https://unplugin.unjs.io), so the same `typebook()` factory ships for each bundler — import it from the matching entry:

`@dennation/typebook/{vite,rollup,rolldown,webpack,rspack,esbuild,farm}`

## Package exports

| Import | Description |
|---|---|
| `@dennation/typebook` | The scanner core — `collectComponentInfos`, `TypeScriptClient`, `classifyPropGroup` — plus the React-free types (`TypebookConfig`, `ComponentInfo`, `TypebookPlugin`, `PropInfo`, …). |
| `@dennation/typebook/plugins/llm-instructions` | `llmInstructions()`, `markdownFormat()`, `hideGroups()`, `DEFAULT_PROP_FILTER`, `DEFAULT_KEPT_PROPS`, and the `LlmInstructionsOptions` / `LlmFormat` / `PropFilter` types. |
| `@dennation/typebook/{vite,rollup,…}` | The `typebook()` bundler plugin, one entry per bundler. |

## Requirements

- TypeScript >= 5 (peer, optional — the scan degrades gracefully without it)
- A supported bundler (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm)

## License

MIT
