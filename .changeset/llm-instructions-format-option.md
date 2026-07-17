---
"@dennation/typebook": minor
---

`llmInstructions`: add a `format` option — `(component: ComponentInfo) => string` — to control each file's contents. Defaults to `markdownFormat` (the built-in card); `importFrom`/`filterProps` configure that default. Pass your own to emit JSON, MDX, or any other shape. `markdownFormat` and the `LlmFormat` type are exported so the default can be wrapped instead of rewritten.
