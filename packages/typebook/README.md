<div align="center">

# @dennation/typebook

**Scan your React components' TypeScript types with a bundler plugin and generate documentation — starting with AI-agent instructions.**

[![npm version](https://img.shields.io/npm/v/@dennation/typebook)](https://www.npmjs.com/package/@dennation/typebook)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

Point `typebook()` at your components. It reads their prop types, defaults and JSDoc **from the TypeScript types** (one Compiler-API scan, no wrapper calls, no runtime), and sub-plugins turn that scan into artifacts. The first one, `aiInstructions()`, writes Markdown docs for AI coding agents (Claude Code, Codex, Cursor) following the [`llms.txt`](https://llmstxt.org) convention — so agents know your components' real APIs instead of guessing.

> **Early release.** This version ships the **scanner core** and the **AI-instructions** plugin. The stories / docs-kit runtime is in progress.

## Install

```bash
npm install -D @dennation/typebook
```

## Quick start

Add the plugin for your bundler, point `components` at your source, and enable `aiInstructions()`:

```ts
// vite.config.ts
import { typebook } from "@dennation/typebook/vite";
import { aiInstructions } from "@dennation/typebook/plugins/ai-instructions";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    typebook({
      components: "src/components/**/*.tsx",
      plugins: [aiInstructions({ importFrom: "@acme/ui" })],
    }),
  ],
});
```

On build (and live on change in dev) it writes, by default under `.ai/components/`:

- **`llms.txt`** — an index of every component (`[Name](Name.md): summary`).
- **`llms-full.txt`** — every card concatenated, for full-context ingestion.
- **`<Component>.md`** — one card each: import line, description, `@remarks` usage notes, deprecation, and a props table with exhaustive union values.

Point your agent's memory (`CLAUDE.md`, `AGENTS.md`) at `llms.txt`; it reads the card it needs on demand.

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

## `aiInstructions()` options

| Option | Type | Description |
|---|---|---|
| `out` | `string \| (doc) => string` | Where each card goes — a directory, or a function for a full path per component (e.g. next to its source). Default `.ai/components`. |
| `importFrom` | `string \| (doc) => string` | Module each component is imported from — prints the `import { X } from "…"` line. Omit to skip it. |
| `title` / `description` | `string` | H1 title and blockquote summary of the index/full file. |
| `indexFile` | `string \| false` | Path of the `llms.txt` index. `false` to skip. |
| `fullFile` | `string \| false` | Path of `llms-full.txt`. `false` to skip. |
| `includeInherited` | `boolean` | Include framework-inherited props (DOM attributes). Default `false`. |

## Every bundler

Built on [unplugin](https://unplugin.unjs.io), so the same `typebook()` factory ships for each bundler — import it from the matching entry:

`@dennation/typebook/{vite,rollup,rolldown,webpack,rspack,esbuild,farm}`

## Package exports

| Import | Description |
|---|---|
| `@dennation/typebook` | The scanner core — `collectComponentDocs`, `componentToMarkdown`, `TypeScriptClient`, `scanMetaCalls`, `parseProgram`, `injectMetaProps`, … — plus the React-free types (`TypebookConfig`, `ComponentDoc`, `TypebookPlugin`, `PropInfo`, …). |
| `@dennation/typebook/plugins/ai-instructions` | `aiInstructions()`, `AiInstructionsOptions`. |
| `@dennation/typebook/{vite,rollup,…}` | The `typebook()` bundler plugin. |

## Requirements

- TypeScript >= 5 (peer, optional — the scan degrades gracefully without it)
- A supported bundler (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm)

## License

MIT
