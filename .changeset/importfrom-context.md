---
"@dennation/typebook": minor
---

Consistent location context for the `llmInstructions` callbacks:

- `ComponentInfo` gains **`dir`** — the component's own folder (the directory of `sourceFile`). Available to every callback, so none has to re-derive it from `sourceFile` by hand.
- `entryPath` and `importFrom` now take the same second argument **`{ root }`** (the project root) — the only environment value a path/specifier builder needs. Co-locate with `component.dir`, or build a central path from `root`; derive an import subpath with `` `@acme/ui/${path.relative(root, c.dir)}` ``.

The old `EntryPathContext.componentDir` is gone (use `component.dir`); `entryPath: (c) => path.join(c.dir, ...)` for co-location. `filterComponents`/`format` stay `(component)` — they get `component.dir` too, no unused `root`.
