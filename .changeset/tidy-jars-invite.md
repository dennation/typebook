---
"@dennation/typebook": minor
---

The core now only scans components and dispatches commands — plugins bring their own commands and do their own work. `typebook <command>` runs whatever the configured plugins registered; `dev` / `build` in the config name which of them a bundler repeats.

Fixes: trailing whitespace from JSDoc leaking into generated files, a dev-server loop where writes triggered endless regeneration, and same-named components in different folders silently overwriting each other's cards.

**Breaking:** `TypebookPlugin` is `{ name, commands }` — the `generate` hook, `FileMap`, `generateFiles`/`writeFiles`/`checkFiles` and `emitToOutDir`/`entryPath`/`indexPath` are gone; `llmInstructions` takes one `outDir` and registers `llm-instructions:generate` / `llm-instructions:check`.
