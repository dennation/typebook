---
"@dennation/typebook": patch
---

`llmInstructions`: rename the callback parameter `doc` → `component` in `out`/`importFrom` (it's a `ComponentInfo`, and the other callbacks — `format`, `filterComponents`, `filterProps` — already use `component`). Signature-only; no behaviour change.
