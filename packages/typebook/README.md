<div align="center">

# @dennation/typebook

**A toolkit for documenting React components from their TypeScript types.**

Point it at your components — one Compiler-API scan reads their props, defaults and JSDoc, and plugins turn that into whatever you need.

[![npm version](https://img.shields.io/npm/v/@dennation/typebook)](https://www.npmjs.com/package/@dennation/typebook)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## What it is

`@dennation/typebook` scans your React components **by type** — a single TypeScript Compiler-API pass extracts every component's prop types, defaults, JSDoc and deprecations into a structured model (`ComponentInfo`). No wrapper calls, no decorators, no runtime.

That scan is the foundation. **Plugins** consume it and emit artifacts — documentation for AI agents today, more to come.

> **Early release.** The scanner core and the `llm-instructions` plugin ship today; a stories / docs-kit runtime is in progress.

## Install

```bash
npm install -D @dennation/typebook
```

## Quick start

Add the plugin for your bundler, point `components` at your source, and enable the plugins you want:

```ts
// vite.config.ts
import { typebook } from "@dennation/typebook/vite";
import { llmInstructions } from "@dennation/typebook/plugins/llm-instructions";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    typebook({
      components: "src/components/**/*.tsx",
      plugins: [
        llmInstructions({
          out: ".ai/components", // where per-component cards go
          indexFile: "llms.txt", // llms.txt index at the repo root
          importFrom: "@acme/ui",
        }),
      ],
    }),
  ],
});
```

On build — and live on change in dev — the scan runs once and every enabled plugin gets the result.

## Plugins

Sub-plugins receive the scan result (`ComponentInfo[]`) and produce artifacts. Enable them in `typebook({ plugins: [...] })`.

### `llm-instructions`

```
@dennation/typebook/plugins/llm-instructions
```

Generates documentation for AI coding agents (Claude Code, Codex, Cursor) following the [`llms.txt`](https://llmstxt.org) convention — so agents work from your components' **real** APIs instead of guessing. You choose where everything lands (there are no default paths — `out` and `indexFile` are required):

- **`<Component>.md`** — one card each: import line, description, `@remarks` usage notes, deprecation, and a props table with exhaustive union values. Located under `out` (or via `out`'s function, e.g. next to each source file).
- **`indexFile`** — an `llms.txt` index of every component (`[Name](Name.md): summary`). Put it at the repo root, where the convention expects it.

Point your agent's memory (`CLAUDE.md`, `AGENTS.md`) at your `indexFile`; it reads the card it needs on demand.

````md
## Button

Primary call-to-action button.

```tsx
import { Button } from "@acme/ui";
```

**Usage**

Use for the main action only; don't nest buttons.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | – | Button size |
| `onClick` | `() => void` | – | ✔ | Fired on click |
````

Usage guidance comes from the component's `@remarks` JSDoc tag; the exhaustive prop values come from the union types — both give the agent fewer ways to be wrong.

**Options**

| Option | Type | Description |
|---|---|---|
| `out` **(required)** | `string \| (doc) => string` | Where each card goes — a directory, or a function for a full path per component (e.g. next to its source). |
| `indexFile` **(required)** | `string \| false` | Path of the `llms.txt` index, or `false` to skip it. |
| `importFrom` | `string \| (doc) => string` | Module each component is imported from — prints the `import { X } from "…"` line. Omit to skip it. |
| `title` / `description` | `string` | H1 title and blockquote summary of the index/full file. |
| `filterProps` | `(prop, component) => boolean` | Which props each card surfaces. Defaults to `DEFAULT_PROP_FILTER` (hides `DEFAULT_HIDDEN_GROUPS`); pass `hideGroups(...)` to change the group set, or any predicate. |

**Shipping to a consumer project**

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
| `@dennation/typebook` | The scanner core — `collectComponentInfos`, `TypeScriptClient`, `scanMetaCalls`, `parseProgram`, `injectMetaProps`, … — plus the React-free types (`TypebookConfig`, `ComponentInfo`, `TypebookPlugin`, `PropInfo`, …). |
| `@dennation/typebook/plugins/llm-instructions` | `llmInstructions()`, `LlmInstructionsOptions`. |
| `@dennation/typebook/{vite,rollup,…}` | The `typebook()` bundler plugin. |

## Requirements

- TypeScript >= 5 (peer, optional — the scan degrades gracefully without it)
- A supported bundler (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm)

## License

MIT
