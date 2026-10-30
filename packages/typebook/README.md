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

Point `components` at your source and enable a plugin to emit something:

```ts
// typebook.config.ts
import { defineConfig } from "@dennation/typebook";

export default defineConfig({
  components: "src/components/**/*.tsx",
  plugins: [
    // enable a plugin to emit artifacts — see llm-instructions below
  ],
});
```

`components` takes a glob, a path, or a list; a `!` pattern excludes, which is how you
keep stories, tests or fixtures out of the scan:

```ts
components: ["src/components/**/*.tsx", "!src/components/**/*.stories.tsx"],
```

**Scan what you export, not every file.** The scan reads a module's exports, so pointing
`components` at your public entries documents exactly the API a consumer gets — including
compound components, whose members become `Parent.Member`:

```ts
// src/components/tabs/index.ts
export const Tabs = { Root: TabsRoot, List: TabsList, Tab: TabsTab };
```

```ts
components: "src/components/*/index.ts",   // → Tabs.Root, Tabs.List, Tabs.Tab — imported as `Tabs`
```

`Object.assign(Root, { Tab })` and `Tabs.Tab = TabsTab` are read the same way, and so is an
annotated export (`Tabs: TabsParts = { … }`) or a declaration file. A glob over
`**/*.tsx` would instead surface the internal `TabsTab` under a name nobody can import.

Then run one of the commands your plugins registered:

```bash
npx typebook llm-instructions:generate
```

**The core does one thing: it scans your components.** It has no commands of its own — every
command comes from a plugin, and `typebook` with no arguments lists what the configured
plugins actually brought:

```
  Commands:
    llm-instructions:check     fail if the cards are out of date, writing nothing
    llm-instructions:generate  write the module cards and their index
```

Command names are the plugin's to choose, and a good one says what it does and whose it is —
`check` alone tells you nothing once a second plugin shows up. A name belongs to exactly one
plugin; two plugins claiming it is an error, not a fan-out.

Add a plugin, get its commands. No bundler is involved at any point.

### Letting a bundler run them

Optional. Name the commands you want repeated automatically, and add the plugin for your
bundler:

```ts
export default defineConfig({
  components: "src/components/**/*.tsx",
  plugins: [llmInstructions({ outDir: "docs/components" })],

  dev: [],                             // nothing while developing
  build: ["llm-instructions:check"],   // fail the build if the cards are stale
})
```

**A build should verify, not write.** The final stage editing tracked source leaves CI with a
dirty tree, discards changes nobody commits, and re-invalidates its own cache. Writing stays
something you ask for — run the command yourself, or list it in `dev` if you want a dev server
to keep artifacts fresh as you type.

## With a task runner (Turborepo)

Because every command runs without a bundler, generation becomes its own cached task instead
of something bolted onto your build. Two files:

```jsonc
// packages/ui/package.json
{
  "scripts": {
    "docs": "typebook llm-instructions:generate",
    "docs:check": "typebook llm-instructions:check"
  }
}
```

```jsonc
// turbo.json
{
  "tasks": {
    "docs": {
      "inputs": ["$TURBO_DEFAULT$", "!docs/**"],   // exclude the task's own output
      "outputs": ["docs/**"]
    },
    "docs:check": {}
  }
}
```

Then `turbo docs` regenerates only when something that can change a prop changed, and
`turbo docs:check` is what CI runs. Measured on a small package:

```
turbo docs   (first run)        993ms
turbo docs   (unchanged)          5ms   >>> FULL TURBO
turbo docs   (docs/ deleted)     26ms   >>> FULL TURBO — restored from cache, task never ran
turbo docs   (component edited)  ~1s    cache miss, regenerated
```

Three things worth knowing:

**Leave `inputs` otherwise alone.** Turborepo's default — every Git-tracked file in the
package, plus the lockfile and internal dependencies — is what makes the cache correct. The
scan resolves types through your whole import graph, so a hand-written whitelist like
`src/components/**` would miss a base type edited in a neighbouring file and serve stale docs
from cache. The one exception is `!docs/**`: a task shouldn't have its own output among its
inputs.

**Keep `build` out of it.** Leave `dev` / `build` empty in `typebook.config.ts` and your
bundler never touches typebook — no TypeScript scan inside the build, nothing written into
tracked source, nothing for the build cache to fight with. Verification is `docs:check`, its
own task, and it fails with the list of stale files.

**Commit the output.** `docs/**` in Git plus `docs:check` in CI means a stale commit is caught
before review, and agents in the repo read current cards. Prefer not to commit? `.gitignore`
the folder and let `turbo docs` produce it — the cache makes that cheap.

## Plugins

A plugin is a name and the commands it contributes. Its commands get the scan result on demand and do whatever they do — the core dispatches them and has no opinion about the rest.

```ts
{
  name: "my-plugin",
  commands: {
    emit: {
      describe: "one line shown in `typebook` with no arguments",
      async run(ctx) {
        const components = await ctx.components()   // lazy: costs nothing if unused
        const modules = await ctx.modules()         // the same, grouped by scanned file
        // …produce whatever you produce
      },
    },
  },
}
```

`ctx` also carries `root`, the `args` that followed the command name, and `trigger`
(`"cli"` / `"dev"` / `"build"`). Every command in a run shares one scan. Enable a plugin by
listing it under `plugins` in the config.

### `llm-instructions`

Writes documentation for AI coding agents (Claude Code, Codex, Cursor) so they work from your components' **real** APIs instead of guessing. It emits one Markdown card per **module** plus a Markdown index with one line per module.

```ts
import { llmInstructions } from "@dennation/typebook/plugins/llm-instructions";

// inside the config's `plugins: [ … ]`
llmInstructions({
  outDir: "docs/components",
  importFrom: (m) => `@acme/ui/${m.name}`, // the import printed in each card and index line
});
```

That writes `docs/components/{module}.md` per module plus `docs/components/index.md`
listing them. Everything lands in that one directory and the index links each card
relative to itself, so it's **self-contained** — copy it into `dist`, publish it with
the package, or serve it as static files, and the links keep working.

Then point your agent's memory (`CLAUDE.md`, `AGENTS.md`) at the index; it reads the
card it needs on demand. For a **published** package, see [Shipping to a consumer
project](#shipping-to-a-consumer-project).

#### Modules

A **module** is the components of one scanned file — the file your `components` glob
matched, e.g. `src/components/form/index.ts`. Its name is that file's folder (`form`).
An agent uses a module's parts together and imports them in one line, so that is the
unit it gets: one card, one index line — not `Form.Root`, `Form.Field` and `Form.Input`
on three cards with nothing saying how they fit.

A module's description and examples come **only** from a JSDoc block tagged `@module`
in that file. No block — no module description and no example; nothing is borrowed
from a component:

````ts
// src/components/form/index.ts
/**
 * Native form with a field grid.
 *
 * Two columns. `Form.Field` and every `Form.*` span both; any other child takes one —
 * give it `col-span-full`.
 *
 * @example
 * ```tsx
 * <Form.Root>
 * 	<Form.Input name="email" label="Email" />
 * 	<Button type="submit" className="col-span-full">Send</Button>
 * </Form.Root>
 * ```
 * @module
 */
export { Form } from "./ui/Form";
````

- `@example` may repeat. A body with its own ` ``` ` fence is taken as written; one
  without is fenced as `tsx`.
- A component's description is still the JSDoc above its declaration (for a compound
  part, above that part's own component), and `@deprecated` still goes on components.
  A module is deprecated when all of its components are.

#### Card

The same layout for every module, one component or ten: module description → import →
examples → parts. Each part is the component as named in code, its description,
`@remarks` usage guidance, deprecation and a props table with exhaustive union values:

````md
## form

Native form with a field grid.

Two columns. `Form.Field` and every `Form.*` span both; any other child takes one —
give it `col-span-full`.

```tsx
import { Form } from "@acme/ui/form";
```

**Example**

```tsx
<Form.Root>
	<Form.Input name="email" label="Email" />
	<Button type="submit" className="col-span-full">Send</Button>
</Form.Root>
```

### Form.Root

Native form and the grid container for `Form.Field`.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `"md" \| "sm"` | `"sm"` | – | Size of the fields and controls inside. |

### Form.Input

Input with a label, a description and an error.

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `label` | `ReactNode` | – | – | Label text or a ReactNode slot. |
````

The import line carries every binding of the module (a compound part `Form.Root` is
reached through `Form`). The usage note comes from a component's `@remarks` JSDoc; the
exhaustive prop values come from the union types — both give the agent fewer ways to be
wrong. A one-component module is laid out the same, with one part: avoiding a repeated
description between the `@module` block and the component is up to the JSDoc author.

#### Index

The index is meant to sit in an agent's context whole, so each line is the import
itself, linking the card:

```md
# @acme/ui

> Components of the Acme design system.

- [`import { Button } from "@acme/ui/button"`](button.md)
- [`import { Form } from "@acme/ui/form"`](form.md) — Native form with a field grid · parts: Form.Root, Form.Field, Form.Input
- [`import { Popover, PopoverTrigger, PopoverContent } from "@acme/ui/popover"`](popover.md) — A panel floating next to an element
- [`import { Dialog, DialogClose } from "@acme/ui/legacy-dialog"`](legacy-dialog.md) · deprecated
```

- ` — …` is the first line of the module description, when there is one.
- ` · parts: …` lists the names the import hides — a compound module's members
  (`Form.Root` behind `Form`), as in code, in export order. Separate exports (`Popover`)
  are already in the import, so they aren't repeated. In a module where not everything
  is deprecated, a deprecated part reads `Name (deprecated)`.
- ` · deprecated` marks a module whose every component is deprecated.
- Lines are sorted by module name. Without `importFrom`, the link text is the bindings.

It registers two commands:

| Command | What it does |
|---|---|
| `llm-instructions:generate` | makes `outDir` hold exactly the current cards and index |
| `llm-instructions:check` | fails with the list of differences, writing nothing — run it in CI |

> **`outDir` belongs to the plugin.** `generate` makes it match the scan exactly, which means
> deleting files it no longer produces — otherwise a deleted module would leave its card
> behind forever, and an agent would find it and read documentation for something that no
> longer exists. `check` counts such a leftover as out of date too. Point `outDir` at a
> directory only this plugin writes to; don't mix hand-written pages in.

#### Options

| Option | Type | Description |
|---|---|---|
| `outDir` **(required)** | `string` | The directory everything lands in — absolute, or relative to the project root. Owned by the plugin: `generate` deletes anything in it that it no longer produces. |
| `indexName` | `string \| false` | Filename of the Markdown index. Default `"index.md"`; `false` skips it. Reference it from your `AGENTS.md`/`CLAUDE.md`. |
| `fileName` | `(module, { root }) => string` | Filename of a module's card, relative to `outDir`. Default `` `${m.name}.md` ``. May nest (`` (m) => `forms/${m.name}.md` ``), may not escape the directory. |
| `filterComponents` | `(component) => boolean` | Which components are documented (`true` keeps). Defaults to all. Applied before grouping: a module left with no components gets no card and no index line, and its import loses the dropped bindings. |
| `importFrom` | `string \| (module, { root }) => string` | Where a module is imported from — prints one `import { A, B } from "…"` with all its bindings, in the card and as the index link. A string, or a function that gets `{ root }` (derive a subpath from `module.dir`: `` (m, { root }) => `@acme/ui/${path.relative(root, m.dir)}` ``). Omit to skip it. |
| `filterProps` | `PropFilter` (map or predicate) | Which props a card surfaces. A **map** keyed by group or prop name (`{ element: false, href: true }`, prop name wins, unlisted kept) or a predicate. Defaults to `DEFAULT_PROP_FILTER`; spread to override. Configures the default `format` only. |
| `keepOwnProps` | `boolean` | Keep a component's own props regardless of `filterProps`. Default `true`; `false` filters own props too. |
| `format` | `(module) => string` | How each module becomes its file's contents. Defaults to `markdownFormat` (the card above). Pass your own for a different shape — the full `ModuleInfo` (after `filterComponents`) in, string out. |
| `title` / `description` | `string` | H1 title and blockquote summary of the index. |

#### Migrating from per-component cards (≤ 0.7)

The unit changed from a component to a module, so the options that took a component now
take a module:

| Before | After |
|---|---|
| `fileName: (c) => …`, default `` `${c.name}.md` `` | `fileName: (m) => …`, default `` `${m.name}.md` `` — `m.name` is the folder name |
| `importFrom: (c) => …` | `importFrom: (m) => …` — `m.dir` is the same folder `c.dir` was |
| `format: (c) => …` | `format: (m) => …` — the components are in `m.components` |
| `markdownFormat(opts)(component)` | `markdownFormat(opts)(module)` |
| index line `- [Name](Name.md): description` | `` - [`import { … } from "…"`](module.md) — description `` |

`filterComponents`, `filterProps`, `keepOwnProps`, `outDir`, `indexName`, `title` and
`description` are unchanged. Two more things to check:

- **Default filenames collide by folder name now.** `components/dialog` and
  `deprecated/dialog` both default to `dialog.md`; generation fails naming both. Give
  `fileName` the subpath: `` (m, { root }) => `${path.relative(path.join(root, "src"), m.dir)}.md` ``.
- **Module prose is opt-in.** Until a scanned file has a `@module` block, its card and
  index line carry no module description — only the components' own. Add one per entry
  file, starting with the one-line summary the index shows.

A plugin of your own can read modules too: `ctx.modules()` is lazy and shared like
`ctx.components()`, and `collectModuleInfos(components)` builds them from a `scan()`.

#### Recipes

**Rename or group the cards** — `fileName` returns a path relative to `outDir`, so it can
nest. It gets the module (its folder is `module.dir`) and `{ root }`:

```ts
// rename
llmInstructions({ outDir: "docs", fileName: (m) => `${m.name}.gen.md` });

// mirror your source layout — collisions become impossible by construction
llmInstructions({
  outDir: "docs",
  fileName: (m, { root }) => `${path.relative(path.join(root, "src/components"), m.dir)}.md`,
});

// place one module by hand — key by source file, since folder names may repeat
const PLACE: Record<string, string> = {
  "src/legacy/dialog/index.ts": "legacy/dialog.md",
};
llmInstructions({
  outDir: "docs",
  fileName: (m, { root }) => PLACE[path.relative(root, m.sourceFile)] ?? `${m.name}.md`,
});
```

The index links whatever paths you produce, relative to itself. A name that escapes
`outDir` is an error — staying inside is what keeps the directory copyable as a unit.

**Same-named modules in different folders** (`components/dialog`, `deprecated/dialog`)
are exactly why `fileName` exists. The default flat layout maps both to `dialog.md`: one
would silently overwrite the other, and the index would list both under the same link —
so an agent following one line would read the other's props. Rather than pick a winner,
generation fails and names both files; mirroring the source layout (above) separates
them. Nothing is written when it fails, so your tree is untouched.

**Need the docs somewhere else too?** One generation writes to one place — there is no
"also copy it there" option, because your build already has better ones. Copy the folder
(`cp -R docs/components dist/docs`), generate straight into `public/` so the bundler
copies it for you, or just list the folder in `package.json#files` to publish it as-is.

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

**Emit a different format** — `format` takes the `ModuleInfo` and returns the file body, so you can produce JSON, MDX, anything (match the extension in `fileName`):

```ts
llmInstructions({
  outDir: "docs",
  fileName: (m) => `${m.name}.json`,
  format: (m) => JSON.stringify({ import: m.bindings, components: m.components }, null, 2),
});
```

**Extend the default card** instead of rewriting it — `markdownFormat` is the exported default:

```ts
import { markdownFormat } from "@dennation/typebook/plugins/llm-instructions";

const card = markdownFormat({ importFrom: "@acme/ui" });
llmInstructions({ format: (m) => `<!-- generated by typebook -->\n\n${card(m)}` });
```

**Title the index** (its H1 + summary header):

```ts
llmInstructions({ title: "Acme UI", description: "Components for the Acme design system." });
```

#### Shipping to a consumer project

The generated docs are ordinary source files — the module cards and their index in one `outDir`. Commit them and run `llm-instructions:check` in CI (they're derived, so it should always pass), then reach a downstream project in two steps. Nothing auto-discovers the index: no agent scans `node_modules` for it, so you reference it (step 2).

> Prefer to keep generated files out of git? `.gitignore` the folder and run `llm-instructions:generate` as a build step instead. If you do commit them, `llm-instructions:check` in CI keeps them honest.

1. **Include the docs in the package.** List the folder in `package.json#files` so npm packs it (it includes any listed committed file, not just `dist`):

   ```jsonc
   "files": ["dist", "docs/components"]
   ```

   The index links each card by relative path, so `node_modules/@acme/ui/docs/components/index.md` resolves to the cards as-is.

2. **Reference the index from the consumer's agent memory** — the file the agent auto-loads:

   - **CLAUDE.md** — `@import` inlines it into context: `@./node_modules/@acme/ui/docs/components/index.md`
   - **AGENTS.md** — no import mechanism; a pointer line the agent opens on demand: `` UI component reference (props, imports, usage): `./node_modules/@acme/ui/docs/components/index.md` ``

## Bundler plugin

Optional. It reads the same `typebook.config.ts` and runs the commands named in `dev` /
`build`, at `buildStart` — before compilation, so a command may generate source the same
build then compiles:

```ts
// vite.config.ts
import { typebook } from "@dennation/typebook/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [typebook(), /* …your framework plugin, e.g. react() */],
});
```

It takes a path (`typebook({ configFile: "./custom.config.ts" })`), never the config
itself — one source of truth, so the CLI and a bundler run can't drift apart.

Built on [unplugin](https://unplugin.unjs.io), so the same `typebook()` factory ships for each bundler — import it from the matching entry:

`@dennation/typebook/{vite,rollup,rolldown,webpack,rspack,esbuild,farm}`

## Package exports

| Import | Description |
|---|---|
| `@dennation/typebook` | The core: `scan()`, `loadConfig`, `defineConfig`, `resolveComponentFiles`, the command dispatcher (`runCommands`, `resolveCommand`, `listCommands`), the scanner internals (`collectComponentInfos`, `collectModuleInfos`, `TypeScriptClient`, `classifyPropGroup`) and the React-free types (`TypebookConfig`, `TypebookPlugin`, `PluginCommand`, `CommandCtx`, `ComponentInfo`, `ModuleInfo`, `PropInfo`, …). No bundler involved. |
| `@dennation/typebook/plugins/llm-instructions` | `llmInstructions()`, `markdownFormat()`, `hideGroups()`, `DEFAULT_PROP_FILTER`, `DEFAULT_KEPT_PROPS`, and the `LlmInstructionsOptions` / `LlmFormat` / `PropFilter` types. |
| `@dennation/typebook/{vite,rollup,…}` | The `typebook()` bundler plugin, one entry per bundler. |

## Requirements

- TypeScript >= 5 (peer, optional — the scan degrades gracefully without it)
- Node >= 22.18 for a `.ts` config file (older versions: use `.mjs`)
- A bundler only if you want the plugin (Vite, Rollup, Rolldown, webpack, Rspack, esbuild, Farm)

## License

MIT
