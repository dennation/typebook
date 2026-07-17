---
"@dennation/typebook": minor
---

`llmInstructions`: the output options are reworked. `entryPath` (was `out`) is now a **function you write** — `(component, { componentDir, root }) => string` — that returns the **full** card path, so the filename is explicit and nothing is appended under the hood. Join `componentDir` to co-locate (`path.join(componentDir, c.name + ".md")`) or `root` for a central folder; an absolute return is used as-is, a relative one resolves against `root`. `indexFile` is renamed to `indexPath` (the index, relative to the project root; `false` to skip). `ComponentInfo` gains nothing; a new `EntryPathContext` type is exported.
