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

// inside typebook({ plugins: [ … ] })
llmInstructions({
  out: (doc) => doc.sourceFile.replace(/\.tsx$/, ".md"), // Button.tsx → Button.md
  indexFile: "llms.txt", // llms.txt index at the repo root
  importFrom: "@acme/ui", // the import line printed in each card
});
```

Point your agent's memory (`CLAUDE.md`, `AGENTS.md`) at the `indexFile`; it reads the card it needs on demand. For a **published** package, the docs travel differently — see [Shipping to a consumer project](#shipping-to-a-consumer-project).

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
| `out` **(required)** | `string \| (doc) => string` | Where each card goes: a function returning a full path per component — e.g. next to its source, `doc.sourceFile.replace(/\.tsx$/, ".md")` — or a directory string (`{out}/{Name}.md`). |
| `indexFile` **(required)** | `string \| false` | Path of the `llms.txt` index, or `false` to skip it. |
| `filterComponents` | `(component) => boolean` | Which components get a card and index entry (`true` keeps). Defaults to all. Use it to hide deprecated components or re-exports you don't own. |
| `importFrom` | `string \| (doc) => string` | Module each component is imported from — prints the `import { X } from "…"` line. Omit to skip it. |
| `filterProps` | `(prop, component) => boolean` | Which props a card surfaces. Defaults to `DEFAULT_PROP_FILTER` (hides `DEFAULT_HIDDEN_GROUPS`); compose with `hideGroups(...)`. Configures the default `format` only. |
| `format` | `(component) => string` | How each component becomes its file's contents. Defaults to `markdownFormat` (the card above). Pass your own for a different shape — full `ComponentInfo` in, string out. |
| `title` / `description` | `string` | H1 title and blockquote summary of the `llms.txt` index. |

#### Recipes

**Drop only some components** — hide deprecated ones, or re-exports you don't own:

```ts
llmInstructions({ filterComponents: (c) => c.deprecated === undefined });
```

**Tune the prop filter** — the default surfaces a component's own props plus a few broadly useful native names (`disabled`, `type`, `href`, … in `DEFAULT_KEPT_PROPS`) and hides the rest. Compose the exported defaults to keep an extra inherited attribute, or to surface a whole hidden group:

```ts
import { DEFAULT_HIDDEN_GROUPS, DEFAULT_KEPT_PROPS, hideGroups } from "@dennation/typebook/plugins/llm-instructions";

// also keep the inherited `maxLength` attribute
llmInstructions({
  filterProps: hideGroups(DEFAULT_HIDDEN_GROUPS, { except: [...DEFAULT_KEPT_PROPS, "maxLength"] }),
});
```

**Emit a different format** — `format` takes the scanned `ComponentInfo` and returns the file body, so you can produce JSON, MDX, anything (match the extension in `out`):

```ts
llmInstructions({
  out: (doc) => doc.sourceFile.replace(/\.tsx$/, ".json"),
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

When your components are a published package, the generated docs are just files — ship them, then point the *consumer's* agent at the index. The name `llms.txt` triggers nothing on its own: no agent scans `node_modules` (or a website) for it. Two steps make the docs reach a downstream project:

1. **Include the files in the package.** Generate into a published folder and list it in `package.json#files` so it lands in the npm tarball:

   ```jsonc
   "files": ["dist", "llms.txt", "llms/"]
   ```

   The index links cards by relative path, so `node_modules/@acme/ui/llms.txt` → `node_modules/@acme/ui/llms/Button.md` resolves as-is.

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
| `@dennation/typebook/plugins/llm-instructions` | `llmInstructions()`, `markdownFormat()`, `hideGroups()`, `DEFAULT_PROP_FILTER`, and the `LlmInstructionsOptions` / `LlmFormat` types. |
| `@dennation/typebook/{vite,rollup,…}` | The `typebook()` bundler plugin, one entry per bundler. |

## Requirements

- TypeScript >= 5 (peer, optional — the scan degrades gracefully without it)
- A supported bundler (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm)

## License

MIT
