---
"@dennation/typebook": minor
---

`llm-instructions` documents modules instead of components: one card and one index line per scanned file, with prose and examples from its `@module` JSDoc block. `fileName`, `importFrom` and `format` now receive a `ModuleInfo`; commands get `ctx.modules()`.
