---
"@dennation/typebook": minor
---

`llmInstructions`: add `filterComponents: (component) => boolean` to drop whole components (deprecated ones, foreign re-exports) from the cards and index.

`typebook`: add `failOnError` — a plugin whose `generate` throws now warns and keeps the build green by default; set `failOnError: true` to fail the build in CI.

Default prop filter: hide the `react` group again (`ref`/`key` are noise in an agent's card) while keeping `children` via `DEFAULT_KEPT_PROPS`.
